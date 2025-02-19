import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WorkoutCard } from "./stats/WorkoutCard";
import { WeightProgressCard } from "./stats/WeightProgressCard";
import { MeasurementCard } from "./stats/MeasurementCard";
import { TrainerStats } from "./stats/TrainerStats";

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

export const StatsCards = () => {
  const [unreadCheckIns, setUnreadCheckIns] = useState(0);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
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

      if (profile) {
        setUserRole(profile.role);

        if (profile.role === 'client') {
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

        if (profile.role === 'trainer') {
          const { data: coachClients, error: clientsError } = await supabase
            .from('coach_clients')
            .select('client_id')
            .eq('coach_id', user.id);

          if (clientsError) {
            toast({
              title: "Error",
              description: "Failed to load clients",
              variant: "destructive",
            });
            return;
          }

          const clientIds = coachClients?.map(client => client.client_id) || [];

          const { data: checkIns, error } = await supabase
            .from('weekly_checkins')
            .select('id, client_id')
            .eq('status', 'pending')
            .in('client_id', clientIds);

          if (error) {
            toast({
              title: "Error",
              description: "Failed to load check-ins count",
              variant: "destructive",
            });
            return;
          }

          setUnreadCheckIns(checkIns?.length || 0);
          
          // TODO: Replace with actual messages query once message table is created
          setUnreadMessages(3); // Temporary mock data
        }
      }
    };

    fetchData();
  }, [toast]);

  const getMeasurementData = (key: keyof MeasurementsData) => {
    return measurementsHistory.map(m => ({
      value: m[key],
      date: new Date(m.created_at).toLocaleDateString()
    })).filter(d => d.value !== null);
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {userRole === 'trainer' && (
        <TrainerStats 
          unreadCheckIns={unreadCheckIns}
          unreadMessages={unreadMessages}
        />
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
};
