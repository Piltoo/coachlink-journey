
import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { subDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";

type Measurement = {
  weight_kg: number | null;
  waist_cm: number | null;
  chest_cm: number | null;
  hips_cm: number | null;
  thigh_cm: number | null;
  arm_cm: number | null;
  created_at: string;
};

type HealthAssessment = {
  target_weight: number;
  starting_weight: number;
};

export const ClientProgress = () => {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [healthAssessment, setHealthAssessment] = useState<HealthAssessment | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const thirtyDaysAgo = subDays(new Date(), 30);

      // Hämta hälsobedömningen för att få målvikten
      const { data: healthData, error: healthError } = await supabase
        .from('client_health_assessments')
        .select('target_weight, starting_weight')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (healthError) {
        console.error("Error fetching health assessment:", healthError);
        toast({
          title: "Error",
          description: "Failed to load health assessment data",
          variant: "destructive",
        });
        return;
      }

      setHealthAssessment(healthData);

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
            arm_cm,
            weight_kg
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

  const latest = getLatestMeasurement();

  if (!latest || !healthAssessment) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100">
          <p className="text-muted-foreground">Ingen data tillgänglig ännu</p>
        </GlassCard>
      </div>
    );
  }

  const currentWeight = latest.weight_kg || 0;
  const weightProgress = calculateProgress(
    currentWeight,
    healthAssessment.starting_weight,
    healthAssessment.target_weight
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100">
        <div className="flex flex-col space-y-4">
          <h2 className="text-lg font-medium text-primary/80">Viktframsteg</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Nuvarande: {currentWeight}kg</span>
              <span>Mål: {healthAssessment.target_weight}kg</span>
            </div>
            <Progress value={weightProgress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {weightProgress.toFixed(1)}% framsteg mot målet
            </p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100">
        <div className="flex flex-col space-y-4">
          <h2 className="text-lg font-medium text-primary/80">Mätningsförändringar</h2>
          <div className="space-y-3">
            {latest.waist_cm && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Midjemått</span>
                  <span>{latest.waist_cm}cm</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
            )}
            {latest.chest_cm && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Bröstkorg</span>
                  <span>{latest.chest_cm}cm</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
