
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { subDays } from "date-fns";
import { WorkoutCard } from "./stats/WorkoutCard";
import { WeightProgressCard } from "./stats/WeightProgressCard";
import { MeasurementCard } from "./stats/MeasurementCard";
import { PaymentsCard } from "./PaymentsCard";
import { MissedPaymentsCard } from "./MissedPaymentsCard";
import { GlassCard } from "@/components/ui/glass-card";

interface WeightData {
  weight_kg: number;
  created_at: string;
}

interface MeasurementValue {
  value: number;
  date: string;
}

interface MeasurementsData {
  waist_cm: number | null;
  chest_cm: number | null;
  hips_cm: number | null;
  thigh_cm: number | null;
  arm_cm: number | null;
  created_at: string;
}

type MeasurementKey = keyof Omit<MeasurementsData, 'created_at'>;

export function StatsCards() {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [activeClients, setActiveClients] = useState(0);
  const [newClientsThisWeek, setNewClientsThisWeek] = useState(0);
  const [pendingCheckins, setPendingCheckins] = useState(0);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [recentWeight, setRecentWeight] = useState<WeightData | null>(null);
  const [targetWeight, setTargetWeight] = useState<number>(75);
  const [measurementsHistory, setMeasurementsHistory] = useState<MeasurementsData[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role) {
        setUserRole(profile.role);
      }

      if (profile?.role === 'coach') {
        // Fetch active clients count
        const { data: activeClientsData } = await supabase
          .from('coach_clients')
          .select('created_at', { count: 'exact' })
          .eq('coach_id', user.id)
          .eq('status', 'active');

        setActiveClients(activeClientsData?.length || 0);

        // Fetch new clients this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const { data: newClients } = await supabase
          .from('coach_clients')
          .select('created_at', { count: 'exact' })
          .eq('coach_id', user.id)
          .eq('status', 'active')
          .gte('created_at', oneWeekAgo.toISOString());

        setNewClientsThisWeek(newClients?.length || 0);

        // Fetch pending check-ins
        const { data: checkins } = await supabase
          .from('weekly_checkins')
          .select('id', { count: 'exact' })
          .eq('reviewed', false);

        setPendingCheckins(checkins?.length || 0);

        // Fetch unread messages
        const { data: messages } = await supabase
          .from('messages')
          .select('id', { count: 'exact' })
          .eq('receiver_id', user.id)
          .eq('status', 'sent');

        setUnreadMessages(messages?.length || 0);
      } else if (profile?.role === 'client') {
        const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

        // Fetch most recent weight
        const { data: weightData } = await supabase
          .from('weekly_checkins')
          .select('weight_kg, created_at')
          .eq('client_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (weightData) {
          setRecentWeight(weightData);
        }

        // Fetch measurements history
        const { data: measurementsData } = await supabase
          .from('measurements')
          .select(`
            waist_cm,
            chest_cm,
            hips_cm,
            thigh_cm,
            arm_cm,
            created_at
          `)
          .gte('created_at', thirtyDaysAgo)
          .order('created_at', { ascending: true });

        if (measurementsData) {
          setMeasurementsHistory(measurementsData);
        }
      }
    };

    fetchData();
  }, []);

  const getMeasurementData = (key: MeasurementKey): MeasurementValue[] => {
    return measurementsHistory
      .map(m => ({
        value: m[key] as number | null,
        date: new Date(m.created_at).toLocaleDateString()
      }))
      .filter((d): d is MeasurementValue => d.value !== null);
  };

  return (
    <div className="space-y-4">
      {userRole === 'coach' && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100">
              <h2 className="text-sm font-medium text-primary/80 mb-1">Active Clients</h2>
              <p className="text-2xl font-bold text-primary">{activeClients}</p>
              <span className="text-xs text-accent">+{newClientsThisWeek} new this week</span>
            </GlassCard>

            <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100">
              <h2 className="text-sm font-medium text-primary/80 mb-1">Pending Check-ins</h2>
              <p className="text-2xl font-bold text-primary">{pendingCheckins}</p>
              <span className="text-xs text-accent">Requires review</span>
            </GlassCard>

            <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100">
              <h2 className="text-sm font-medium text-primary/80 mb-1">Today's Appointments</h2>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">No appointments scheduled for today</p>
              </div>
            </GlassCard>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100">
              <h2 className="text-sm font-medium text-primary/80 mb-1">Pending Session Requests</h2>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">No pending session requests</p>
              </div>
            </GlassCard>

            <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100">
              <h2 className="text-sm font-medium text-primary/80 mb-1">Unread Messages</h2>
              <p className="text-2xl font-bold text-primary">{unreadMessages}</p>
              <span className="text-xs text-accent">New messages</span>
            </GlassCard>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <PaymentsCard />
            <MissedPaymentsCard />
          </div>
        </>
      )}
      {userRole === 'client' && (
        <>
          <WorkoutCard />
          <WeightProgressCard 
            recentWeight={recentWeight}
            targetWeight={targetWeight}
          />
          <div className="grid grid-cols-2 gap-4">
            <MeasurementCard title="Waist" data={getMeasurementData("waist_cm")} />
            <MeasurementCard title="Hips" data={getMeasurementData("hips_cm")} />
            <MeasurementCard title="Thigh" data={getMeasurementData("thigh_cm")} />
            <MeasurementCard title="Arm" data={getMeasurementData("arm_cm")} />
          </div>
        </>
      )}
    </div>
  );
}
