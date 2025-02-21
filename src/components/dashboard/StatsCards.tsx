
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GlassCard } from "@/components/ui/glass-card";

type Stats = {
  activeClients: { value: number; description: string };
  pendingCheckins: { value: number; description: string };
  unreadMessages: { value: number; description: string };
  upcomingPayments: { value: number; description: string };
};

export function StatsCards() {
  const [stats, setStats] = useState<Stats>({
    activeClients: { value: 0, description: "+0 new this week" },
    pendingCheckins: { value: 0, description: "Requires review" },
    unreadMessages: { value: 0, description: "New messages" },
    upcomingPayments: { value: 0, description: "Due this week" }
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
          // Fetch stats data
          const [activeClientsData, newClientsData, checkinsData, messagesData, paymentsData] = await Promise.all([
            supabase
              .from('coach_clients')
              .select('id')
              .eq('coach_id', user.id)
              .eq('status', 'active'),
            supabase
              .from('coach_clients')
              .select('id')
              .eq('coach_id', user.id)
              .eq('status', 'active')
              .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
            supabase
              .from('weekly_checkins')
              .select('id')
              .eq('status', 'pending'),
            supabase
              .from('messages')
              .select('id')
              .eq('receiver_id', user.id)
              .eq('status', 'sent'),
            supabase
              .from('payments')
              .select('amount')
              .eq('status', 'pending')
              .lte('due_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
          ]);

          const upcomingPaymentsTotal = paymentsData.data?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

          setStats({
            activeClients: {
              value: activeClientsData.data?.length || 0,
              description: `+${newClientsData.data?.length || 0} new this week`
            },
            pendingCheckins: {
              value: checkinsData.data?.length || 0,
              description: "Requires review"
            },
            unreadMessages: {
              value: messagesData.data?.length || 0,
              description: "New messages"
            },
            upcomingPayments: {
              value: upcomingPaymentsTotal,
              description: "Due this week"
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
        <h3 className="text-sm font-medium text-gray-600 mb-2">Pending Check-ins</h3>
        <p className="text-4xl font-bold text-[#1B4332]">{stats.pendingCheckins.value}</p>
        <p className="text-xs text-gray-500 mt-1">{stats.pendingCheckins.description}</p>
      </GlassCard>

      <GlassCard className="p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Upcoming Payments</h3>
        <p className="text-4xl font-bold text-[#1B4332]">{stats.upcomingPayments.value} kr</p>
        <p className="text-xs text-gray-500 mt-1">{stats.upcomingPayments.description}</p>
      </GlassCard>

      <GlassCard className="p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Unread Messages</h3>
        <p className="text-4xl font-bold text-[#1B4332]">{stats.unreadMessages.value}</p>
        <p className="text-xs text-gray-500 mt-1">{stats.unreadMessages.description}</p>
      </GlassCard>
    </div>
  );
}
