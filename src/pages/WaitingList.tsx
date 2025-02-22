
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { UserCheck, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

type PendingClient = {
  id: string;
  full_name: string | null;
  email: string;
  requested_services: string[];
  registration_status: string | null;
};

export default function WaitingList() {
  const [pendingClients, setPendingClients] = useState<PendingClient[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingClients();
  }, []);

  const fetchPendingClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log("Fetching clients for coach:", user.id);

      const { data, error } = await supabase
        .from('coach_clients')
        .select(`
          client_id,
          requested_services,
          profiles!coach_clients_client_id_fkey (
            id,
            full_name,
            email,
            registration_status
          )
        `)
        .eq('coach_id', user.id)
        .eq('status', 'not_connected');

      if (error) {
        console.error("Error fetching clients:", error);
        toast({
          title: "Error",
          description: "Failed to fetch available clients",
          variant: "destructive",
        });
        return;
      }

      console.log("Received data:", data);

      if (data) {
        const formattedClients = data.map(record => ({
          id: record.profiles.id,
          full_name: record.profiles.full_name,
          email: record.profiles.email,
          requested_services: record.requested_services || [],
          registration_status: record.profiles.registration_status
        }));
        console.log("Formatted clients:", formattedClients);
        setPendingClients(formattedClients);
      }
    } catch (error) {
      console.error("Error in fetchPendingClients:", error);
      toast({
        title: "Error",
        description: "Failed to fetch available clients",
        variant: "destructive",
      });
    }
  };

  const handleClientResponse = async (clientId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log("Activating client:", clientId);

      // Update the coach-client relationship status to active
      const { error: relationshipError } = await supabase
        .from('coach_clients')
        .update({ status: 'active' })
        .eq('client_id', clientId)
        .eq('coach_id', user.id);

      if (relationshipError) {
        console.error("Relationship error:", relationshipError);
        throw relationshipError;
      }

      // Update the client's registration status to approved
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ registration_status: 'approved' })
        .eq('id', clientId);

      if (profileError) {
        console.error("Profile error:", profileError);
        throw profileError;
      }

      setPendingClients(prev => prev.filter(client => client.id !== clientId));
      
      toast({
        title: "Success",
        description: "Client activated successfully",
      });
    } catch (error) {
      console.error("Error updating client status:", error);
      toast({
        title: "Error",
        description: "Failed to activate client",
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
              <h1 className="text-2xl font-semibold text-primary">Available Clients</h1>
            </div>
            <div className="text-sm text-gray-600">
              {pendingClients.length} client{pendingClients.length !== 1 ? 's' : ''} available
            </div>
          </div>

          <div className="grid gap-4">
            {pendingClients.map((client) => (
              <Card key={client.id} className="overflow-hidden">
                <CardHeader className="bg-white/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {client.full_name || 'Unnamed Client'}
                      </h3>
                      <p className="text-sm text-gray-500">{client.email}</p>
                    </div>
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50"
                        onClick={() => handleClientResponse(client.id)}
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        Activate
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="bg-white/30">
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Requested Services:</h4>
                    <div className="flex flex-wrap gap-2">
                      {client.requested_services && client.requested_services.length > 0 ? (
                        client.requested_services.map((service, index) => (
                          <Badge key={index} variant="secondary" className="bg-green-100/50">
                            {service}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No specific services requested</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {pendingClients.length === 0 && (
              <Card className="p-6">
                <p className="text-center text-gray-500">No available clients</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
