
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
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First get the user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log("No user found in useStats");
          return;
        }

        // Check if user is a coach
        const { data: isCoach, error: coachError } = await supabase
          .rpc('is_coach', { user_id: user.id });

        if (coachError) {
          console.error("Error checking coach status:", coachError);
          return;
        }

        if (!isCoach) {
          console.log("User is not a coach");
          return;
        }

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

        // Get count of not connected clients (new arrivals)
        const { data: notConnectedClients, error: notConnectedError } = await supabase
          .from('coach_clients')
          .select('client_id', { count: 'exact' })
          .eq('coach_id', user.id)
          .eq('status', 'not_connected');

        if (notConnectedError) throw notConnectedError;

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
            value: notConnectedClients?.count || 0,
            description: "New potential clients"
          },
          totalSales: {
            value: totalWeeklySales,
            description: "This week"
          }
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  return { stats, todaySessions, isLoading };
};
