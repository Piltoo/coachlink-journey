
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { PaymentsCard } from "./PaymentsCard";
import { MissedPaymentsCard } from "./MissedPaymentsCard";
import { GlassCard } from "@/components/ui/glass-card";

type UserRole = 'client' | 'coach';

type DashboardStats = {
  activeClients: number;
  newClientsThisWeek: number;
  pendingCheckins: number;
  unreadMessages: number;
};

export function StatsCards() {
  const [stats, setStats] = useState<DashboardStats>({
    activeClients: 0,
    newClientsThisWeek: 0,
    pendingCheckins: 0,
    unreadMessages: 0
  });
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!profile) return;
        
        setUserRole(profile.role as UserRole);

        if (profile.role === 'coach') {
          // Fetch active clients
          const { data: activeClients } = await supabase
            .from('coach_clients')
            .select('*', { count: 'exact' })
            .eq('coach_id', user.id)
            .eq('status', 'active');

          // Fetch new clients this week
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          const { data: newClients } = await supabase
            .from('coach_clients')
            .select('*', { count: 'exact' })
            .eq('coach_id', user.id)
            .eq('status', 'active')
            .gte('created_at', oneWeekAgo.toISOString());

          // Fetch pending check-ins
          const { data: checkins } = await supabase
            .from('weekly_checkins')
            .select('*', { count: 'exact' })
            .eq('reviewed', false);

          // Fetch unread messages
          const { data: messages } = await supabase
            .from('messages')
            .select('*', { count: 'exact' })
            .eq('receiver_id', user.id)
            .eq('status', 'sent');

          setStats({
            activeClients: activeClients?.length || 0,
            newClientsThisWeek: newClients?.length || 0,
            pendingCheckins: checkins?.length || 0,
            unreadMessages: messages?.length || 0
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [toast]);

  if (userRole !== 'coach') return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <GlassCard className="p-6 bg-white shadow-lg rounded-xl">
          <h3 className="text-lg font-semibold text-primary mb-4">Active Clients</h3>
          <p className="text-4xl font-bold text-primary mb-2">{stats.activeClients}</p>
          <p className="text-sm text-green-600">+{stats.newClientsThisWeek} new this week</p>
        </GlassCard>

        <GlassCard className="p-6 bg-white shadow-lg rounded-xl">
          <h3 className="text-lg font-semibold text-primary mb-4">Pending Check-ins</h3>
          <p className="text-4xl font-bold text-primary mb-2">{stats.pendingCheckins}</p>
          <p className="text-sm text-muted-foreground">Requires review</p>
        </GlassCard>

        <GlassCard className="p-6 bg-white shadow-lg rounded-xl">
          <h3 className="text-lg font-semibold text-primary mb-4">Today's Appointments</h3>
          <p className="text-sm text-muted-foreground">No appointments scheduled for today</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <GlassCard className="p-6 bg-white shadow-lg rounded-xl">
          <h3 className="text-lg font-semibold text-primary mb-4">Pending Session Requests</h3>
          <p className="text-sm text-muted-foreground">No pending session requests</p>
        </GlassCard>

        <GlassCard className="p-6 bg-white shadow-lg rounded-xl">
          <h3 className="text-lg font-semibold text-primary mb-4">Unread Messages</h3>
          <p className="text-4xl font-bold text-primary mb-2">{stats.unreadMessages}</p>
          <p className="text-sm text-muted-foreground">New messages</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <PaymentsCard />
        <MissedPaymentsCard />
      </div>
    </div>
  );
}
