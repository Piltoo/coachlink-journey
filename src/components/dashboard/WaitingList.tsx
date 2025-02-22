
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { UserCheck, UserX, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

type PendingClient = {
  id: string;
  full_name: string | null;
  email: string;
  requested_services: string[];
};

export function WaitingList() {
  const [pendingClients, setPendingClients] = useState<PendingClient[]>([]);
  const { toast } = useToast();

  useEffect(() => {
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

    fetchPendingClients();
  }, []);

  // Remove this condition so the card is always visible for coaches
  // if (pendingClients.length === 0) return null;

  return (
    <GlassCard className="p-6 border-2 border-[#ea384c]/20 bg-[#ea384c]/5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-[#ea384c]" />
          <h2 className="text-lg font-semibold text-[#ea384c]">Waiting List</h2>
        </div>
        <Link to="/waiting-list">
          <Button variant="outline" size="sm" className="text-[#ea384c] hover:text-[#ea384c]/80 border-[#ea384c]/20 hover:bg-[#ea384c]/5">
            View All ({pendingClients.length})
          </Button>
        </Link>
      </div>
      <ScrollArea className="h-[200px]">
        <div className="space-y-4">
          {pendingClients.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No pending clients in the queue
            </div>
          ) : (
            <>
              {pendingClients.slice(0, 3).map((client) => (
                <div key={client.id} className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-[#ea384c]/10">
                  <div>
                    <h3 className="font-medium text-gray-900">{client.full_name || 'Unnamed Client'}</h3>
                    <p className="text-sm text-gray-500">{client.email}</p>
                  </div>
                </div>
              ))}
              {pendingClients.length > 3 && (
                <div className="text-center text-sm text-gray-500 pt-2">
                  And {pendingClients.length - 3} more...
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </GlassCard>
  );
}
