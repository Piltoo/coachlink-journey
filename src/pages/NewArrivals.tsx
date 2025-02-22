
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ClientProfileCard } from "@/components/dashboard/ClientProfileCard";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NewArrivalsHeader } from "@/components/new-arrivals/NewArrivalsHeader";
import { ClientsTable } from "@/components/new-arrivals/ClientsTable";
import { Client } from "@/components/new-arrivals/types";

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

      const { data: connectedClients } = await supabase
        .from('coach_clients')
        .select('client_id');
      
      const connectedIds = connectedClients?.map(row => row.client_id) || [];

      const { data: availableClients, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, requested_services')
        .eq('role', 'client')
        .not(connectedIds.length > 0 ? 'id' : 'id', 'in', `(${connectedIds.join(',')})`)

      if (profilesError) {
        throw profilesError;
      }

      if (availableClients) {
        const clientPromises = availableClients.map(async (profile) => {
          const [nutritionPlans, workoutPlans, workoutSessions] = await Promise.all([
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
              .maybeSingle(),
          ]);

          return {
            id: profile.id,
            full_name: profile.full_name,
            email: profile.email,
            status: 'not_connected',
            hasNutritionPlan: !!nutritionPlans.data,
            hasWorkoutPlan: !!workoutPlans.data,
            hasPersonalTraining: !!workoutSessions.data,
            requested_services: profile.requested_services,
          };
        });

        const formattedClients = await Promise.all(clientPromises);
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
        .insert({
          coach_id: user.id,
          client_id: clientId,
          status: newStatus,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Client added successfully",
      });

      fetchClients();
    } catch (error: any) {
      console.error("Error updating client status:", error);
      toast({
        title: "Error",
        description: "Failed to add client: " + error.message,
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

  const filteredClients = clients.filter(client => {
    const matchesSearch = (
      (client.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return matchesSearch;
  });

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <NewArrivalsHeader 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          <ScrollArea className="h-[calc(100vh-12rem)] w-full">
            <ClientsTable
              clients={filteredClients}
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
