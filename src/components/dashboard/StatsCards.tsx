
import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const StatsCards = () => {
  const [unreadCheckIns, setUnreadCheckIns] = useState(0);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserRole(profile.role);

        // If user is a trainer, fetch pending check-ins count
        if (profile.role === 'trainer') {
          // First, get the client IDs for this coach
          const { data: coachClients, error: clientsError } = await supabase
            .from('coach_clients')
            .select('client_id')
            .eq('coach_id', user.id);

          if (clientsError) {
            toast({
              title: "Error",
              description: "Failed to load clients",
              variant: "destructive",
            });
            return;
          }

          const clientIds = coachClients?.map(client => client.client_id) || [];

          // Then fetch pending check-ins for these clients
          const { data: checkIns, error } = await supabase
            .from('weekly_checkins')
            .select('id, client_id')
            .eq('status', 'pending')
            .in('client_id', clientIds);

          if (error) {
            toast({
              title: "Error",
              description: "Failed to load check-ins count",
              variant: "destructive",
            });
            return;
          }

          setUnreadCheckIns(checkIns?.length || 0);
        }
      }
    };

    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100">
        <div className="flex flex-col">
          <h2 className="text-lg font-medium text-primary/80 mb-2">Active Clients</h2>
          <p className="text-4xl font-bold text-primary">12</p>
          <span className="text-sm text-accent mt-2">↑ 2 new this week</span>
        </div>
      </GlassCard>
      
      <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100">
        <div className="flex flex-col">
          <h2 className="text-lg font-medium text-primary/80 mb-2">Today's Sessions</h2>
          <p className="text-4xl font-bold text-primary">5</p>
          <span className="text-sm text-accent mt-2">Next session in 2h</span>
        </div>
      </GlassCard>

      {userRole === 'trainer' && (
        <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100">
          <div className="flex flex-col">
            <h2 className="text-lg font-medium text-primary/80 mb-2">Pending Check-ins</h2>
            <p className="text-4xl font-bold text-primary">{unreadCheckIns}</p>
            <span className="text-sm text-accent mt-2">Requires your review</span>
          </div>
        </GlassCard>
      )}
    </div>
  );
};
