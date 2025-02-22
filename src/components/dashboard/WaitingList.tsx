
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

  return (
    <GlassCard className="p-4 border-2 border-[#ea384c]/20 bg-[#ea384c]/5 w-full md:w-[300px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[#ea384c]" />
          <h2 className="text-sm font-semibold text-[#ea384c]">Waiting List ({pendingClients.length})</h2>
        </div>
        <Link to="/waiting-list">
          <Button variant="outline" size="sm" className="h-7 px-2 text-xs text-[#ea384c] hover:text-[#ea384c]/80 border-[#ea384c]/20 hover:bg-[#ea384c]/5">
            View All
          </Button>
        </Link>
      </div>
      <ScrollArea className="h-[120px]">
        <div className="space-y-2">
          {pendingClients.length === 0 ? (
            <div className="text-center text-gray-500 py-4 text-sm">
              No pending clients
            </div>
          ) : (
            <>
              {pendingClients.slice(0, 3).map((client) => (
                <div key={client.id} className="flex items-center justify-between p-2 bg-white/50 rounded-md border border-[#ea384c]/10">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{client.full_name || 'Unnamed Client'}</h3>
                    <p className="text-xs text-gray-500">{client.email}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </ScrollArea>
    </GlassCard>
  );
}
