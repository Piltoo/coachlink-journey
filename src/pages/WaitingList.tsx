
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { UserCheck, UserX, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

type PendingClient = {
  id: string;
  full_name: string | null;
  email: string;
  requested_services: string[];
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

      console.log("Current user ID:", user.id); // Debug log

      // Updated query with correct foreign key reference
      const { data, error } = await supabase
        .from('coach_clients')
        .select(`
          client_id,
          requested_services,
          client:client_id (
            id,
            full_name,
            email
          )
        `)
        .eq('coach_id', user.id)
        .eq('status', 'pending');

      console.log("Query response:", { data, error }); // Debug log

      if (error) {
        console.error("Error fetching clients:", error);
        toast({
          title: "Error",
          description: "Failed to fetch pending clients",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        const formattedClients = data.map(client => ({
          id: client.client.id,
          full_name: client.client.full_name,
          email: client.client.email,
          requested_services: client.requested_services || []
        }));
        console.log("Formatted clients:", formattedClients); // Debug log
        setPendingClients(formattedClients);
      }
    } catch (error) {
      console.error("Error in fetchPendingClients:", error);
      toast({
        title: "Error",
        description: "Failed to fetch pending clients",
        variant: "destructive",
      });
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
      
      toast({
        title: "Success",
        description: `Client ${approved ? 'approved' : 'rejected'} successfully`,
      });
    } catch (error) {
      console.error("Error updating client status:", error);
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
              <Card key={client.id} className="overflow-hidden">
                <CardHeader className="bg-white/50">
                  <div className="flex items-start justify-between">
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
                        className="text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50"
                        onClick={() => handleClientResponse(client.id, true)}
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                        onClick={() => handleClientResponse(client.id, false)}
                      >
                        <UserX className="w-4 h-4 mr-1" />
                        Reject
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
                <p className="text-center text-gray-500">No pending clients</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
