
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Stats, TodaySession } from "./types";
import { addDays, startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";

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

        // Get date ranges using date-fns
        const now = new Date();
        const weekStart = startOfWeek(now);
        const weekEnd = endOfWeek(now);
        const todayStart = startOfDay(now);
        const todayEnd = endOfDay(now);

        const [
          { data: activeClients },
          { data: newClients },
          { data: pendingCheckins },
          { data: unreadMessages },
          { data: notConnectedClients },
          { data: weeklyPayments },
          { data: sessions }
        ] = await Promise.all([
          // Active clients count
          supabase
            .from('coach_clients')
            .select('id')
            .eq('coach_id', user.id)
            .eq('status', 'active'),
          
          // New clients this week count
          supabase
            .from('coach_clients')
            .select('id')
            .eq('coach_id', user.id)
            .eq('status', 'active')
            .gte('created_at', weekStart.toISOString())
            .lte('created_at', weekEnd.toISOString()),
          
          // Pending check-ins count
          supabase
            .from('weekly_checkins')
            .select('id')
            .eq('status', 'pending'),
          
          // Unread messages count
          supabase
            .from('messages')
            .select('id')
            .eq('receiver_id', user.id)
            .eq('status', 'sent'),
          
          // New arrivals count
          supabase
            .from('coach_clients')
            .select('id')
            .eq('coach_id', user.id)
            .eq('status', 'not_connected'),
          
          // Weekly payments
          supabase
            .from('payments')
            .select('amount')
            .eq('status', 'paid')
            .gte('paid_at', weekStart.toISOString())
            .lte('paid_at', weekEnd.toISOString()),
          
          // Today's sessions
          supabase
            .from('workout_sessions')
            .select(`
              id,
              start_time,
              client_id,
              profiles!workout_sessions_client_id_fkey (
                full_name,
                email
              )
            `)
            .eq('coach_id', user.id)
            .eq('status', 'confirmed')
            .gte('start_time', todayStart.toISOString())
            .lt('start_time', todayEnd.toISOString())
            .order('start_time')
        ]);

        if (sessions) {
          const formattedSessions = sessions.map(session => ({
            start_time: session.start_time,
            client: {
              full_name: session.profiles?.full_name || '',
              email: session.profiles?.email || ''
            }
          }));
          setTodaySessions(formattedSessions);
        }

        const totalWeeklySales = weeklyPayments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

        setStats({
          activeClients: {
            value: activeClients?.length || 0,
            description: `+${newClients?.length || 0} new this week`
          },
          pendingCheckins: {
            value: pendingCheckins?.length || 0,
            description: "Requires review"
          },
          unreadMessages: {
            value: unreadMessages?.length || 0,
            description: "New messages"
          },
          newArrivals: {
            value: notConnectedClients?.length || 0,
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
