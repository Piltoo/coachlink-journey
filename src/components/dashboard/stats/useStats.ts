
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Stats, TodaySession } from "./types";

export const useStats = () => {
  const [stats, setStats] = useState<Stats>({
    activeClients: { value: 0, description: "+0 new this week" },
    pendingCheckins: { value: 0, description: "Requires review" },
    unreadMessages: { value: 0, description: "New messages" },
    newArrivals: { value: 0, description: "New potential clients" }
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

          // Get all client IDs that are already connected to coaches
          const { data: connectedClients } = await supabase
            .from('coach_clients')
            .select('client_id');
          
          // Get count of unconnected clients (new arrivals)
          const { count: newArrivalsCount } = await supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('role', 'client')
            .not(connectedClients?.length ? 'id' : 'id', 'in', 
              `(${(connectedClients || []).map(c => c.client_id).join(',')})`)

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
              value: newArrivalsCount || 0,
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

  return { stats, todaySessions, userRole };
};
