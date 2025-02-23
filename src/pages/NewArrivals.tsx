
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ClientProfileCard } from "@/components/dashboard/ClientProfileCard";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NewArrivalsHeader } from "@/components/new-arrivals/NewArrivalsHeader";
import { ClientsTable } from "@/components/new-arrivals/ClientsTable";
import { Client } from "@/components/new-arrivals/types";
import { InviteClientDialog } from "@/components/dashboard/InviteClientDialog";
import { Users } from "lucide-react";

const NewArrivals = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const fetchClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("No user found - user is not authenticated");
        return;
      }

      console.log("Fetching clients for coach:", user.id);

      // First verify that the current user is a coach
      const { data: coachProfile, error: coachError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (coachError) throw coachError;
      if (coachProfile.role !== 'coach') {
        throw new Error('Only coaches can view new arrivals');
      }

      const { data: notConnectedClients, error: relationshipsError } = await supabase
        .from('coach_clients')
        .select('client_id, status, requested_services')
        .eq('coach_id', user.id)
        .eq('status', 'not_connected');

      if (relationshipsError) throw relationshipsError;

      if (!notConnectedClients || notConnectedClients.length === 0) {
        setClients([]);
        return;
      }

      const clientIds = notConnectedClients.map(rel => rel.client_id);

      const { data: clientProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', clientIds)
        .eq('role', 'client');

      if (profilesError) throw profilesError;

      if (clientProfiles) {
        // Get additional client data for plans
        const clientPlansPromises = clientProfiles.map(async (profile) => {
          const [nutritionPlan, workoutPlan, workoutSession] = await Promise.all([
            supabase
              .from('nutrition_plans')
              .select('id')
              .eq('client_id', profile.id)
              .maybeSingle(),
            supabase
              .from('workout_plans')
              .select('id')
              .eq('client_id', profile.id)
              .maybeSingle(),
            supabase
              .from('workout_sessions')
              .select('id')
              .eq('client_id', profile.id)
              .maybeSingle()
          ]);

          const relationshipData = notConnectedClients.find(rel => rel.client_id === profile.id);
          
          return {
            id: profile.id,
            full_name: profile.full_name,
            email: profile.email,
            status: 'not_connected',
            hasNutritionPlan: !!nutritionPlan.data,
            hasWorkoutPlan: !!workoutPlan.data,
            hasPersonalTraining: !!workoutSession.data,
            requested_services: relationshipData?.requested_services || []
          } satisfies Client;
        });

        const formattedClients = await Promise.all(clientPlansPromises);
        console.log("Formatted clients:", formattedClients);
        setClients(formattedClients);
      }
    } catch (error: any) {
      console.error("Error in fetchClients:", error);
      toast({
        title: "Error",
        description: "Failed to load new arrivals: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (clientId: string, newStatus: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to perform this action",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('coach_clients')
        .update({ status: newStatus })
        .eq('coach_id', user.id)
        .eq('client_id', clientId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Client status updated successfully",
      });

      fetchClients();
    } catch (error: any) {
      console.error("Error updating client status:", error);
      toast({
        title: "Error",
        description: "Failed to update client status: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm("Are you sure you want to delete this client? This will remove all their data and cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Client deleted successfully",
      });

      fetchClients();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive",
      });
    }
  };

  const handleClientAdded = () => {
    fetchClients();
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-primary">New Arrivals</h1>
            </div>
            <InviteClientDialog onClientAdded={handleClientAdded} />
          </div>

          <NewArrivalsHeader 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          <ScrollArea className="h-[calc(100vh-12rem)] w-full">
            <ClientsTable
              clients={clients.filter(client => 
                (client.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                client.email.toLowerCase().includes(searchTerm.toLowerCase())
              )}
              onViewProfile={setSelectedClientId}
              onAddClient={(clientId) => handleStatusChange(clientId, 'active')}
              onDeleteClient={handleDeleteClient}
            />
          </ScrollArea>

          <Dialog open={!!selectedClientId} onOpenChange={() => setSelectedClientId(null)}>
            <DialogContent className="max-w-4xl h-[90vh]">
              {selectedClientId && (
                <ClientProfileCard
                  clientId={selectedClientId}
                  onUnsubscribe={() => {
                    setSelectedClientId(null);
                    fetchClients();
                  }}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default NewArrivals;
