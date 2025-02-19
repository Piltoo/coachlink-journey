
import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { subDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";

type Measurement = {
  weight_kg: number;
  waist_cm: number | null;
  chest_cm: number | null;
  hips_cm: number | null;
  thigh_cm: number | null;
  arm_cm: number | null;
  created_at: string;
};

export const ClientProgress = () => {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [targetWeight, setTargetWeight] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const thirtyDaysAgo = subDays(new Date(), 30);

      // Fetch measurements from the last 30 days
      const { data: measurementsData, error: measurementsError } = await supabase
        .from('weekly_checkins')
        .select(`
          weight_kg,
          created_at,
          measurements (
            waist_cm,
            chest_cm,
            hips_cm,
            thigh_cm,
            arm_cm
          )
        `)
        .eq('client_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (measurementsError) {
        toast({
          title: "Error",
          description: "Failed to load measurements",
          variant: "destructive",
        });
        return;
      }

      // Transform the data to flatten the measurements
      const transformedMeasurements = measurementsData.map(data => ({
        weight_kg: data.weight_kg,
        created_at: data.created_at,
        ...data.measurements?.[0]
      }));

      setMeasurements(transformedMeasurements);

      // For demo purposes, setting a mock target weight
      // TODO: Implement target weight setting functionality
      setTargetWeight(75);
    };

    fetchData();
  }, [toast]);

  const calculateProgress = (current: number, initial: number, target: number) => {
    if (initial === target) return 100;
    return Math.min(100, Math.max(0, 
      ((initial - current) / (initial - target)) * 100
    ));
  };

  const getLatestMeasurement = () => {
    return measurements[measurements.length - 1] || null;
  };

  const getInitialMeasurement = () => {
    return measurements[0] || null;
  };

  const latest = getLatestMeasurement();
  const initial = getInitialMeasurement();

  if (!latest || !initial || !targetWeight) {
    return null;
  }

  const weightProgress = calculateProgress(
    latest.weight_kg,
    initial.weight_kg,
    targetWeight
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100">
        <div className="flex flex-col space-y-4">
          <h2 className="text-lg font-medium text-primary/80">Weight Progress</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Current: {latest.weight_kg}kg</span>
              <span>Target: {targetWeight}kg</span>
            </div>
            <Progress value={weightProgress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {weightProgress.toFixed(1)}% progress to goal
            </p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100">
        <div className="flex flex-col space-y-4">
          <h2 className="text-lg font-medium text-primary/80">Measurements Changes</h2>
          <div className="space-y-3">
            {latest.waist_cm && initial.waist_cm && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Waist</span>
                  <span>{latest.waist_cm}cm (-{(initial.waist_cm - latest.waist_cm).toFixed(1)}cm)</span>
                </div>
                <Progress value={((initial.waist_cm - latest.waist_cm) / initial.waist_cm) * 100} className="h-2" />
              </div>
            )}
            {latest.chest_cm && initial.chest_cm && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Chest</span>
                  <span>{latest.chest_cm}cm ({(latest.chest_cm - initial.chest_cm).toFixed(1)}cm)</span>
                </div>
                <Progress value={((latest.chest_cm - initial.chest_cm) / initial.chest_cm) * 100} className="h-2" />
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
