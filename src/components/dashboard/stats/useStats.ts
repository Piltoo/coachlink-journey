
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Stats, TodaySession } from "./types";

export const useStats = () => {
  const [stats, setStats] = useState<Stats>({
    activeClients: { value: 0, description: "+0 new this week" },
    pendingCheckins: { value: 0, description: "Requires review" },
    unreadMessages: { value: 0, description: "New messages" },
    newArrivals: { value: 0, description: "New potential clients" },
    totalSales: { value: 0, description: "This week" }
  });
  const [todaySessions, setTodaySessions] = useState<TodaySession[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First get the user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Then get the profile to check the role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        const role = profile?.role || null;
        console.log("User role from profile:", role); // Debug log
        setUserRole(role);

        if (role === 'coach') {
          // Get start and end of current week
          const now = new Date();
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          
          const endOfWeek = new Date(now);
          endOfWeek.setDate(startOfWeek.getDate() + 7);
          endOfWeek.setHours(23, 59, 59, 999);

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

          // Fetch this week's total sales from payments
          const { data: weeklyPayments } = await supabase
            .from('payments')
            .select('amount')
            .eq('status', 'paid')
            .gte('paid_at', startOfWeek.toISOString())
            .lte('paid_at', endOfWeek.toISOString());

          const totalWeeklySales = weeklyPayments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

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
            },
            totalSales: {
              value: totalWeeklySales,
              description: "This week"
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
