import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ClientProfileCard } from "@/components/dashboard/ClientProfileCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NewArrivalsHeader } from "@/components/new-arrivals/NewArrivalsHeader";
import { ClientsTable } from "@/components/new-arrivals/ClientsTable";
import { Client } from "@/components/new-arrivals/types";
import { InviteClientDialog } from "@/components/dashboard/InviteClientDialog";
import { Users } from "lucide-react";
import { useCoachCheck } from "@/hooks/useCoachCheck";
import { Card } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const NewArrivals = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<{ id: string, name: string } | null>(null);
  const { toast } = useToast();
  const { isCoach, isLoading } = useCoachCheck();

  const fetchClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("No user found - user is not authenticated");
        return;
      }

      // Verifiera coachrollen först
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        throw profileError;
      }

      if (!userProfile || userProfile.role !== 'coach') {
        toast({
          title: "Access Denied",
          description: "Only coaches can view new arrivals",
          variant: "destructive",
        });
        setClients([]);
        return;
      }

      console.log("Fetching clients for coach:", user.id);

      // Hämta alla klienter som inte är anslutna
      const { data: notConnectedClients, error: relationshipsError } = await supabase
        .from('coach_clients')
        .select(`
          client_id,
          status,
          requested_services,
          profiles!coach_clients_client_id_fkey (
            id,
            full_name,
            email,
            has_completed_assessment
          )
        `)
        .eq('coach_id', user.id)
        .eq('status', 'not_connected')
        .order('created_at', { ascending: false });

      if (relationshipsError) throw relationshipsError;

      if (!notConnectedClients || notConnectedClients.length === 0) {
        console.log("No not_connected clients found");
        setClients([]);
        return;
      }

      // Formatera klientdata direkt från join-resultatet
      const formattedClients = notConnectedClients.map(client => ({
        id: client.profiles.id,
        full_name: client.profiles.full_name,
        email: client.profiles.email,
        status: client.status,
        requested_services: client.requested_services || [],
        has_completed_assessment: client.profiles.has_completed_assessment
      }));

      console.log("Formatted clients:", formattedClients);
      setClients(formattedClients);
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
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    
    setClientToDelete({ id: clientId, name: client.full_name });
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;

    try {
      // Radera i rätt ordning för att hantera foreign key constraints
      const deleteOperations = [
        // Radera hälsodeklaration
        supabase.from('client_health_assessments').delete().eq('client_id', clientToDelete.id),
        
        // Radera mätningar och check-ins
        supabase.from('measurements').delete().eq('client_id', clientToDelete.id),
        supabase.from('weekly_checkins').delete().eq('client_id', clientToDelete.id),
        
        // Radera tränings- och nutritionsplaner
        supabase.from('workout_sessions').delete().eq('client_id', clientToDelete.id),
        supabase.from('workout_plans').delete().eq('client_id', clientToDelete.id),
        supabase.from('nutrition_plans').delete().eq('client_id', clientToDelete.id),
        
        // Radera coach-client relationen
        supabase.from('coach_clients').delete().eq('client_id', clientToDelete.id),
        
        // Radera profilen sist
        supabase.from('profiles').delete().eq('id', clientToDelete.id)
      ];

      await Promise.all(deleteOperations);

      toast({
        title: "Success",
        description: "Client deleted successfully",
      });

      setIsDeleteDialogOpen(false);
      setClientToDelete(null);
      fetchClients();
    } catch (error: any) {
      console.error("Error deleting client:", error);
      toast({
        title: "Error",
        description: "Failed to delete client: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleClientAdded = async () => {
    try {
      await fetchClients(); // Uppdatera klientlistan
      toast({
        title: "Success",
        description: "Client added successfully",
      });
    } catch (error: any) {
      console.error("Error refreshing clients:", error);
      toast({
        title: "Error",
        description: "Failed to refresh client list: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddClient = async (clientId: string) => {
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

      // Verifiera coachrollen först
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        throw profileError;
      }

      if (!userProfile || userProfile.role !== 'coach') {
        toast({
          title: "Access Denied",
          description: "Only coaches can add clients",
          variant: "destructive",
        });
        return;
      }

      // Uppdatera status till 'active' när klienten läggs till
      const { error } = await supabase
        .from('coach_clients')
        .update({ status: 'active' })
        .eq('coach_id', user.id)
        .eq('client_id', clientId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Client added successfully",
      });

      // Använd navigate istället för window.location.href
      navigate(`/clients/${clientId}`);
    } catch (error: any) {
      console.error("Error adding client:", error);
      toast({
        title: "Error",
        description: "Failed to add client: " + error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isCoach) {
      fetchClients();
    }
  }, [isCoach]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50 flex items-center justify-center">
        <Card className="p-6 bg-white/40 backdrop-blur-lg">
          <p className="text-muted-foreground">Loading...</p>
        </Card>
      </div>
    );
  }

  if (!isCoach) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50 flex items-center justify-center">
        <Card className="p-6 bg-white/40 backdrop-blur-lg border border-green-100">
          <h2 className="text-xl font-semibold text-primary mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">Only coaches can access this page.</p>
        </Card>
      </div>
    );
  }

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
              onViewProfile={(clientId) => navigate(`/clients/${clientId}`)}
              onAddClient={(clientId) => handleAddClient(clientId)}
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

          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Client</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete {clientToDelete?.name}? This action cannot be undone and will remove all their data.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default NewArrivals;
