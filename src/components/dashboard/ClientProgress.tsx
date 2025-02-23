
import { useEffect, useState, useMemo } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { supabase } from "@/integrations/supabase/client";
import { subDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Measurement, HealthAssessment } from "./types";
import { measurementCards } from "./constants";
import { calculateBodyFat } from "./utils";
import { WeightProgress } from "./WeightProgress";
import { MeasurementCard } from "./MeasurementCard";

export const ClientProgress = () => {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [healthAssessment, setHealthAssessment] = useState<HealthAssessment | null>(null);
  const { toast } = useToast();

  const latest = useMemo(() => {
    return measurements[measurements.length - 1] || null;
  }, [measurements]);

  const bodyFatPercentage = useMemo(() => {
    if (!latest || !healthAssessment) return null;
    return calculateBodyFat(latest, healthAssessment);
  }, [latest, healthAssessment]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const thirtyDaysAgo = subDays(new Date(), 30);

      const { data: healthData, error: healthError } = await supabase
        .from('client_health_assessments')
        .select('target_weight, starting_weight, height_cm, gender')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (healthError) {
        console.error("Error fetching health assessment:", healthError);
        toast({
          title: "Error",
          description: "Failed to load health assessment data",
          variant: "destructive",
        });
        return;
      }

      if (healthData) {
        const gender = healthData.gender === 'female' ? 'female' : 'male';
        setHealthAssessment({
          target_weight: healthData.target_weight,
          starting_weight: healthData.starting_weight,
          height_cm: healthData.height_cm || 180,
          gender: gender
        });
      }

      const { data: latestWeeklyCheckin, error: checkinError } = await supabase
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
            neck_cm
          )
        `)
        .eq('client_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (checkinError) {
        toast({
          title: "Error",
          description: "Failed to load measurements",
          variant: "destructive",
        });
        return;
      }

      if (latestWeeklyCheckin) {
        const transformedMeasurements = latestWeeklyCheckin.map(data => ({
          weight_kg: data.weight_kg,
          created_at: data.created_at,
          ...data.measurements?.[0]
        }));

        console.log("Transformed measurements:", transformedMeasurements);
        setMeasurements(transformedMeasurements);
      }
    };

    fetchData();
  }, [toast]);

  if (!latest || !healthAssessment) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100">
          <p className="text-muted-foreground">Ingen data tillgänglig ännu</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <WeightProgress 
        currentWeight={latest.weight_kg || 0}
        healthAssessment={healthAssessment}
        bodyFatPercentage={bodyFatPercentage}
      />

      {measurementCards.map((card) => (
        <MeasurementCard 
          key={card.key}
          card={card}
          measurements={measurements}
        />
      ))}
    </div>
  );
};
