
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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log("No user found in useStats");
          setIsLoading(false);
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

        const [
          { count: activeClientsCount },
          { count: newClientsCount },
          { count: pendingCheckinsCount },
          { count: unreadMessagesCount },
          { count: notConnectedCount },
          { data: weeklyPayments },
          { data: sessions }
        ] = await Promise.all([
          // Active clients count
          supabase
            .from('coach_clients')
            .select('*', { count: 'exact', head: true })
            .eq('coach_id', user.id)
            .eq('status', 'active'),
          
          // New clients this week count
          supabase
            .from('coach_clients')
            .select('*', { count: 'exact', head: true })
            .eq('coach_id', user.id)
            .eq('status', 'active')
            .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
          
          // Pending check-ins count
          supabase
            .from('weekly_checkins')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending'),
          
          // Unread messages count
          supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('receiver_id', user.id)
            .eq('status', 'sent'),
          
          // New arrivals count
          supabase
            .from('coach_clients')
            .select('*', { count: 'exact', head: true })
            .eq('coach_id', user.id)
            .eq('status', 'not_connected'),
          
          // Weekly payments
          supabase
            .from('payments')
            .select('amount')
            .eq('status', 'paid')
            .gte('paid_at', startOfWeek.toISOString())
            .lte('paid_at', endOfWeek.toISOString()),
          
          // Today's sessions
          supabase
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
            .order('start_time')
        ]);

        if (sessions) {
          setTodaySessions(sessions);
        }

        const totalWeeklySales = weeklyPayments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

        setStats({
          activeClients: {
            value: activeClientsCount || 0,
            description: `+${newClientsCount || 0} new this week`
          },
          pendingCheckins: {
            value: pendingCheckinsCount || 0,
            description: "Requires review"
          },
          unreadMessages: {
            value: unreadMessagesCount || 0,
            description: "New messages"
          },
          newArrivals: {
            value: notConnectedCount || 0,
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
