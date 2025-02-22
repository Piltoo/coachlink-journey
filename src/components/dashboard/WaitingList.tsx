
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
  registration_status: string | null;
};

export function WaitingList() {
  const [pendingClients, setPendingClients] = useState<PendingClient[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingClients();
  }, []);

  const fetchPendingClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log("Current user ID:", user.id);

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
        .eq('status', 'pending');

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
        description: "Failed to fetch pending clients",
        variant: "destructive",
      });
    }
  };

  return (
    <GlassCard className="p-4 bg-white/40 backdrop-blur-lg border border-green-100 w-full md:w-[300px] h-[144px] flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary/80" />
          <h2 className="text-sm font-medium text-primary/80">Waiting List</h2>
        </div>
        <Link to="/waiting-list">
          <Button variant="outline" size="sm" className="h-7 px-2 text-xs border-primary/20 hover:bg-primary/5">
            View All
          </Button>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <span className="text-2xl font-bold text-primary">{pendingClients.length}</span>
          <p className="text-xs text-primary/60 mt-1">People in Queue</p>
        </div>
      </div>
    </GlassCard>
  );
}
