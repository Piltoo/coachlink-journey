
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GlassCard } from "@/components/ui/glass-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";

type Stats = {
  activeClients: { value: number; description: string };
  pendingCheckins: { value: number; description: string };
  unreadMessages: { value: number; description: string };
  newArrivals: { value: number; description: string };
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
    unreadMessages: { value: 0, description: "New messages" },
    newArrivals: { value: 0, description: "New potential clients" }
  });
  const [todaySessions, setTodaySessions] = useState<TodaySession[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

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

          // Get all client IDs that are already connected to coaches
          const { data: connectedClients } = await supabase
            .from('coach_clients')
            .select('client_id');
          
          // Get count of unconnected clients (new arrivals)
          const { data: newArrivalsData } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'client')
            .not(connectedClients?.length ? 'id' : 'id', 'in', 
              `(${(connectedClients || []).map(c => c.client_id).join(',')})`)
            .count();

          // Fetch other stats
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
              .eq('status', 'sent'),
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
            },
            newArrivals: {
              value: newArrivalsData?.count || 0,
              description: "New potential clients"
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

  const handleNewArrivalsClick = () => {
    navigate('/new-arrivals');
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Left Side Stats - First Column */}
      <div className="space-y-4">
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
      </div>

      {/* Left Side Stats - Second Column */}
      <div className="space-y-4">
        <GlassCard 
          className="p-4 cursor-pointer transition-all hover:shadow-md hover:bg-green-50/50"
          onClick={handleNewArrivalsClick}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">New Arrivals</h3>
            <UserPlus className="w-5 h-5 text-[#1B4332]" />
          </div>
          <p className="text-4xl font-bold text-[#1B4332]">{stats.newArrivals.value}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.newArrivals.description}</p>
        </GlassCard>

        <GlassCard className="p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Unread Messages</h3>
          <p className="text-4xl font-bold text-[#1B4332]">{stats.unreadMessages.value}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.unreadMessages.description}</p>
        </GlassCard>

        <GlassCard className="p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Missed Payments</h3>
          <p className="text-4xl font-bold text-red-600">0</p>
          <p className="text-xs text-red-500 mt-1">0 kr overdue</p>
        </GlassCard>
      </div>

      {/* Right Side - Today's Assignments (spans 2 columns) */}
      <div className="col-span-2">
        <GlassCard className="p-4 h-full">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Today's Assignments</h3>
          {todaySessions.length > 0 ? (
            <>
              <p className="text-2xl font-bold text-[#1B4332] mb-4">{todaySessions.length} sessions today</p>
              <ScrollArea className="h-[calc(100vh-280px)] w-full pr-4">
                <div className="space-y-3">
                  {todaySessions.map((session, index) => (
                    <div 
                      key={index} 
                      className="flex justify-between items-center p-4 bg-white/60 rounded-lg border border-green-100"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">{session.client.full_name || session.client.email}</h4>
                        <p className="text-sm text-gray-500">Session</p>
                      </div>
                      <span className="text-sm font-medium text-primary">
                        {format(new Date(session.start_time), 'HH:mm')}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="h-[calc(100vh-280px)] flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#1B4332]">No sessions today</p>
                <p className="text-sm text-gray-500 mt-2">Enjoy your free time!</p>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
