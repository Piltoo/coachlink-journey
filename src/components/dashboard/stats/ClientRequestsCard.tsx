
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type ClientRequest = {
  id: string;
  client: {
    id: string;
    full_name: string | null;
    email: string;
  };
  status: string;
};

export const ClientRequestsCard = () => {
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('coach_clients')
      .select(`
        id,
        status,
        client:profiles!coach_clients_client_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq('coach_id', user.id)
      .eq('status', 'pending');

    if (data) {
      setRequests(data);
    }
  };

  const handleRequest = async (requestId: string, clientId: string, approved: boolean) => {
    const { error } = await supabase
      .from('coach_clients')
      .update({ status: approved ? 'active' : 'rejected' })
      .eq('id', requestId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: `Client request ${approved ? 'approved' : 'rejected'} successfully`,
    });
    fetchRequests();
  };

  return (
    <GlassCard className="col-span-2 bg-white/40 backdrop-blur-lg border border-green-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-medium text-primary/80">Client Requests</h2>
        <span className="text-xs text-accent">{requests.length} pending</span>
      </div>
      <div className="space-y-3">
        {requests.length > 0 ? (
          requests.map((request) => (
            <div key={request.id} className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
              <p className="font-medium">{request.client.full_name || request.client.email}</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleRequest(request.id, request.client.id, true)}
                  className="h-8 px-3 text-xs bg-green-500 hover:bg-green-600 text-white"
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRequest(request.id, request.client.id, false)}
                  className="h-8 px-3 text-xs"
                >
                  Decline
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No pending client requests</p>
        )}
      </div>
    </GlassCard>
  );
};
