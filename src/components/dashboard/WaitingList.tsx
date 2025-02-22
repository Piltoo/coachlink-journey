
import { GlassCard } from "@/components/ui/glass-card";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
    <GlassCard className="p-4 border-2 border-[#ea384c]/20 bg-[#ea384c]/5 w-full md:w-[300px] h-[144px] flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[#ea384c]" />
          <h2 className="text-sm font-semibold text-[#ea384c]">Waiting List</h2>
        </div>
        <Link to="/waiting-list">
          <Button variant="outline" size="sm" className="h-7 px-2 text-xs text-[#ea384c] hover:text-[#ea384c]/80 border-[#ea384c]/20 hover:bg-[#ea384c]/5">
            View All
          </Button>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl font-bold text-[#ea384c]">{pendingClients.length}</span>
          <p className="text-sm text-gray-500 mt-2">People in Queue</p>
        </div>
      </div>
    </GlassCard>
  );
}
