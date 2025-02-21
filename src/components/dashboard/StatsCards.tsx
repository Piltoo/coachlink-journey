import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GlassCard } from "@/components/ui/glass-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

type Stats = {
  activeClients: { value: number; description: string };
  pendingCheckins: { value: number; description: string };
  unreadMessages: { value: number; description: string };
};

type TodaySession = {
  start_time: string;
  client: {
    full_name: string | null;
    email: string;
  };
};

export function StatsCards() {
  const [stats, setStats] = useState<Stats>({
    activeClients: { value: 0, description: "+0 new this week" },
    pendingCheckins: { value: 0, description: "Requires review" },
    unreadMessages: { value: 0, description: "New messages" }
  });
  const [todaySessions, setTodaySessions] = useState<TodaySession[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
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
        
        setUserRole(profile.role);

        if (profile.role === 'coach') {
          // Fetch today's sessions
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          const { data: sessions } = await supabase
            .from('workout_sessions')
            .select(`
              start_time,
              client:profiles!workout_sessions_client_id_fkey (
                full_name,
                email
              )
            `)
            .eq('coach_id', user.id)
            .eq('status', 'confirmed')
            .gte('start_time', today.toISOString())
            .lt('start_time', tomorrow.toISOString())
            .order('start_time');

          if (sessions) {
            setTodaySessions(sessions);
          }

          // Fetch stats data
          const [activeClientsData, newClientsData, checkinsData, messagesData] = await Promise.all([
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
              .eq('status', 'sent')
          ]);

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

    fetchData();
  }, [toast]);

  if (userRole !== 'coach') return null;

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="grid grid-cols-4 gap-4">
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
          <h3 className="text-sm font-medium text-gray-600 mb-2">Pending Sessions</h3>
          <p className="text-4xl font-bold text-[#1B4332]">0</p>
          <p className="text-xs text-gray-500 mt-1">No pending sessions</p>
        </GlassCard>

        <GlassCard className="p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Unread Messages</h3>
          <p className="text-4xl font-bold text-[#1B4332]">{stats.unreadMessages.value}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.unreadMessages.description}</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Upcoming Payments</h3>
          <p className="text-4xl font-bold text-[#1B4332]">0</p>
          <p className="text-xs text-gray-500 mt-1">0 kr due this week</p>
        </GlassCard>

        <GlassCard className="p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Missed Payments</h3>
          <p className="text-4xl font-bold text-red-600">0</p>
          <p className="text-xs text-red-500 mt-1">0 kr overdue</p>
        </GlassCard>

        <GlassCard className="col-span-2 p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Today's Assignments</h3>
          {todaySessions.length > 0 ? (
            <>
              <p className="text-2xl font-bold text-[#1B4332] mb-2">{todaySessions.length} sessions</p>
              <ScrollArea className="h-[120px] w-full">
                <div className="space-y-2">
                  {todaySessions.map((session, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">{session.client.full_name || session.client.email}</span>
                      <span className="text-gray-500">
                        {format(new Date(session.start_time), 'HH:mm')}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          ) : (
            <>
              <p className="text-4xl font-bold text-[#1B4332]">0</p>
              <p className="text-xs text-gray-500 mt-1">No sessions today</p>
            </>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
