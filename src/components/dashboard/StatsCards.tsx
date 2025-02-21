import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { subDays } from "date-fns";
import { WorkoutCard } from "./stats/WorkoutCard";
import { WeightProgressCard } from "./stats/WeightProgressCard";
import { MeasurementCard } from "./stats/MeasurementCard";
import { AppointmentsCard } from "./stats/AppointmentsCard";
import { ClientRequestsCard } from "./stats/ClientRequestsCard";
import { GlassCard } from "@/components/ui/glass-card";

type WeightData = {
  weight_kg: number;
  created_at: string;
};

type MeasurementsData = {
  waist_cm: number | null;
  chest_cm: number | null;
  hips_cm: number | null;
  thigh_cm: number | null;
  arm_cm: number | null;
  created_at: string;
};

export function StatsCards() {
  const [unreadMessages, setUnreadMessages] = useState(0);
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
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('id')
          .eq('receiver_id', user.id)
          .eq('status', 'sent');

        if (messagesError) {
          toast({
            title: "Error",
            description: "Failed to load messages",
            variant: "destructive",
          });
        } else {
          setUnreadMessages(messages?.length || 0);
        }
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

  const getMeasurementData = (key: keyof MeasurementsData) => {
    return measurementsHistory
      .map(m => ({
        value: m[key] as number | null,
        date: new Date(m.created_at).toLocaleDateString()
      }))
      .filter((d): d is { value: number; date: string } => d.value !== null);
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {userRole === 'coach' && (
        <>
          <ClientRequestsCard />
          <GlassCard className="col-span-2 bg-white/40 backdrop-blur-lg border border-green-100">
            <div className="flex flex-col">
              <h2 className="text-sm font-medium text-primary/80 mb-1">Unread Messages</h2>
              <p className="text-2xl font-bold text-primary">{unreadMessages}</p>
              <span className="text-xs text-accent mt-1">New messages</span>
            </div>
          </GlassCard>
          <AppointmentsCard />
        </>
      )}
      {userRole === 'client' && (
        <>
          <WorkoutCard />
          <WeightProgressCard 
            recentWeight={recentWeight}
            targetWeight={targetWeight}
          />
          <MeasurementCard title="Waist" data={getMeasurementData("waist_cm")} />
          <MeasurementCard title="Hips" data={getMeasurementData("hips_cm")} />
          <MeasurementCard title="Thigh" data={getMeasurementData("thigh_cm")} />
          <MeasurementCard title="Arm" data={getMeasurementData("arm_cm")} />
        </>
      )}
    </div>
  );
}
