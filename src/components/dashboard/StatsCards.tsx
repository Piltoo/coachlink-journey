
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GlassCard } from "@/components/ui/glass-card";

interface DashboardStats {
  activeClients: {
    value: number;
    description: string;
  };
  pendingCheckins: {
    value: number;
    description: string;
  };
  unreadMessages: {
    value: number;
    description: string;
  };
}

export function StatsCards() {
  const [stats, setStats] = useState<DashboardStats>({
    activeClients: { value: 0, description: "+0 new this week" },
    pendingCheckins: { value: 0, description: "Requires review" },
    unreadMessages: { value: 0, description: "New messages" }
  });
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!profile) return;
        
        setUserRole(profile.role);

        if (profile.role === 'coach') {
          // Get active clients
          const { data: activeClients } = await supabase
            .from('coach_clients')
            .select('id')
            .eq('coach_id', user.id)
            .eq('status', 'active');

          // Get new clients this week
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          const { data: newClients } = await supabase
            .from('coach_clients')
            .select('id')
            .eq('coach_id', user.id)
            .eq('status', 'active')
            .gte('created_at', oneWeekAgo.toISOString());

          // Get pending check-ins
          const { data: checkins } = await supabase
            .from('weekly_checkins')
            .select('id')
            .eq('reviewed', false);

          // Get unread messages
          const { data: messages } = await supabase
            .from('messages')
            .select('id')
            .eq('receiver_id', user.id)
            .eq('status', 'sent');

          setStats({
            activeClients: {
              value: activeClients?.length || 0,
              description: `+${newClients?.length || 0} new this week`
            },
            pendingCheckins: {
              value: checkins?.length || 0,
              description: "Requires review"
            },
            unreadMessages: {
              value: messages?.length || 0,
              description: "New messages"
            }
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      }
    };

    fetchStats();
  }, [toast]);

  if (userRole !== 'coach') return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <GlassCard className="p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Active Clients</h3>
        <p className="text-4xl font-bold text-[#1B4332]">{stats.activeClients.value}</p>
        <p className="text-xs text-green-600 mt-1">{stats.activeClients.description}</p>
      </GlassCard>

      <GlassCard className="p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Today's Appointments</h3>
        <p className="text-4xl font-bold text-[#1B4332]">0</p>
        <p className="text-xs text-gray-500 mt-1">No appointments for today</p>
      </GlassCard>

      <GlassCard className="p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Pending Check-ins</h3>
        <p className="text-4xl font-bold text-[#1B4332]">{stats.pendingCheckins.value}</p>
        <p className="text-xs text-gray-500 mt-1">{stats.pendingCheckins.description}</p>
      </GlassCard>

      <GlassCard className="p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Unread Messages</h3>
        <p className="text-4xl font-bold text-[#1B4332]">{stats.unreadMessages.value}</p>
        <p className="text-xs text-gray-500 mt-1">{stats.unreadMessages.description}</p>
      </GlassCard>
    </div>
  );
}
