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

  // Get latest measurement
  const latest = useMemo(() => {
    return measurements[0] || null;
  }, [measurements]);

  const bodyFatPercentage = useMemo(() => {
    if (!latest || !healthAssessment) return null;
    return calculateBodyFat(latest, healthAssessment);
  }, [latest, healthAssessment]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const thirtyDaysAgo = subDays(new Date(), 30);

        // Fetch health assessment
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

        // First get weekly check-ins
        const { data: checkInsData, error: checkInsError } = await supabase
          .from('weekly_checkins')
          .select('*')
          .eq('client_id', user.id)
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: false });

        if (checkInsError) {
          console.error("Error fetching check-ins:", checkInsError);
          toast({
            title: "Error",
            description: "Failed to load check-in data",
            variant: "destructive",
          });
          return;
        }

        if (!checkInsData || checkInsData.length === 0) {
          console.log("No check-ins found");
          return;
        }

        // Then get measurements using check-in IDs
        const { data: measurementsData, error: measurementsError } = await supabase
          .from('measurements')
          .select('*')
          .in('checkin_id', checkInsData.map(c => c.id))
          .order('created_at', { ascending: false });

        if (measurementsError) {
          console.error("Error fetching measurements:", measurementsError);
          toast({
            title: "Error",
            description: "Failed to load measurement data",
            variant: "destructive",
          });
          return;
        }

        // Combine check-ins with measurements
        const combinedData = checkInsData.map(checkIn => {
          const measurement = measurementsData?.find(m => m.checkin_id === checkIn.id);
          return {
            created_at: checkIn.created_at,
            weight_kg: checkIn.weight_kg,
            ...measurement
          };
        });

        console.log("Combined measurements data:", combinedData);
        setMeasurements(combinedData);

      } catch (error) {
        console.error("Error in fetchData:", error);
        toast({
          title: "Error",
          description: "Failed to load progress data",
          variant: "destructive",
        });
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
