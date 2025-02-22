
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserCheck, UserX, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type PendingClient = {
  id: string;
  full_name: string | null;
  email: string;
  requested_services: string[];
};

export default function WaitingList() {
  const [pendingClients, setPendingClients] = useState<PendingClient[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingClients();
  }, []);

  const fetchPendingClients = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: clients, error: clientsError } = await supabase
      .from('coach_clients')
      .select(`
        client_id,
        profiles!coach_clients_client_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq('coach_id', user.id)
      .eq('status', 'pending');

    if (clientsError) {
      console.error("Error fetching clients:", clientsError);
      return;
    }

    if (clients) {
      const formattedClients = clients.map(c => ({
        id: c.profiles.id,
        full_name: c.profiles.full_name,
        email: c.profiles.email,
        requested_services: []
      }));
      setPendingClients(formattedClients);
    }
  };

  const handleClientResponse = async (clientId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('coach_clients')
        .update({ status: approved ? 'active' : 'rejected' })
        .eq('client_id', clientId);

      if (error) throw error;

      setPendingClients(prev => prev.filter(client => client.id !== clientId));
      setSelectedClientId(null);
      
      toast({
        title: "Success",
        description: `Client ${approved ? 'approved' : 'rejected'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update client status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <h1 className="text-2xl font-semibold text-primary">Waiting List</h1>
            </div>
            <div className="text-sm text-gray-600">
              {pendingClients.length} client{pendingClients.length !== 1 ? 's' : ''} waiting
            </div>
          </div>

          <div className="grid gap-4">
            {pendingClients.map((client) => (
              <Card key={client.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {client.full_name || 'Unnamed Client'}
                    </h3>
                    <p className="text-sm text-gray-500">{client.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 hover:text-green-700"
                      onClick={() => handleClientResponse(client.id, true)}
                    >
                      <UserCheck className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleClientResponse(client.id, false)}
                    >
                      <UserX className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {pendingClients.length === 0 && (
              <Card className="p-6">
                <p className="text-center text-gray-500">No pending clients</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedClientId} onOpenChange={() => setSelectedClientId(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
            <DialogDescription>
              Review client information and manage their access.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
