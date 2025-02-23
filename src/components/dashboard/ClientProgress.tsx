import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type Measurement = {
  weight_kg: number | null;
  waist_cm: number | null;
  chest_cm: number | null;
  hips_cm: number | null;
  thigh_cm: number | null;
  arm_cm: number | null;
  created_at: string;
  neck_cm?: number | null;
};

type HealthAssessment = {
  target_weight: number;
  starting_weight: number;
  height_cm?: number;
  gender?: 'male' | 'female';
};

type MeasurementCard = {
  title: string;
  key: keyof Omit<Measurement, 'created_at'>;
  unit: string;
  color: string;
};

const measurementCards: MeasurementCard[] = [
  { title: "Midjemått", key: "waist_cm", unit: "cm", color: "#10B981" },
  { title: "Bröstkorg", key: "chest_cm", unit: "cm", color: "#3B82F6" },
  { title: "Armar", key: "arm_cm", unit: "cm", color: "#8B5CF6" },
  { title: "Studs", key: "hips_cm", unit: "cm", color: "#EC4899" },
  { title: "Ben", key: "thigh_cm", unit: "cm", color: "#F59E0B" },
];

export const ClientProgress = () => {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [healthAssessment, setHealthAssessment] = useState<HealthAssessment | null>(null);
  const [bodyFatPercentage, setBodyFatPercentage] = useState<number | null>(null);
  const { toast } = useToast();

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
            weight_kg,
            neck_cm
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

      const transformedMeasurements = measurementsData.map(data => ({
        weight_kg: data.weight_kg,
        created_at: data.created_at,
        ...data.measurements?.[0]
      }));

      setMeasurements(transformedMeasurements);
    };

    fetchData();
  }, [toast]);

  useEffect(() => {
    const calculateBodyFat = async () => {
      const latest = measurements[measurements.length - 1];
      
      if (!latest || !latest.waist_cm || !latest.neck_cm || !healthAssessment?.height_cm) {
        setBodyFatPercentage(null);
        return;
      }

      const height = healthAssessment.height_cm;
      const waist = latest.waist_cm;
      const neck = latest.neck_cm;
      const gender = healthAssessment.gender || 'male';
      
      let bodyFat: number;
      
      if (gender === 'male') {
        bodyFat = 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
      } else {
        if (!latest.hips_cm) {
          setBodyFatPercentage(null);
          return;
        }
        const hips = latest.hips_cm;
        bodyFat = 163.205 * Math.log10(waist + hips - neck) - 97.684 * Math.log10(height) - 78.387;
      }
      
      setBodyFatPercentage(Math.min(Math.max(Math.round(bodyFat * 10) / 10, 2), 45));
    };

    calculateBodyFat();
  }, [measurements, healthAssessment]);

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

  const getHealthyRangeText = (gender: 'male' | 'female') => {
    return gender === 'male' 
      ? "En hälsosam kroppsfettsprocent för män är mellan 8-19%"
      : "En hälsosam kroppsfettsprocent för kvinnor är mellan 21-33%";
  };

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

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100">
        <div className="flex flex-col space-y-4">
          <h2 className="text-lg font-medium text-primary/80">Viktframsteg</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Nuvarande: {currentWeight}kg</span>
              <span>Mål: {healthAssessment?.target_weight}kg</span>
            </div>
            <Progress value={weightProgress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {weightProgress.toFixed(1)}% framsteg mot målet
            </p>
            {bodyFatPercentage && healthAssessment?.gender && (
              <div className="mt-4 p-3 bg-green-50 rounded-md">
                <h3 className="text-sm font-medium text-primary/80 mb-1">Uppskattad kroppsfett</h3>
                <p className="text-2xl font-bold text-primary">
                  {bodyFatPercentage}%
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {getHealthyRangeText(healthAssessment.gender)}
                </p>
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {measurementCards.map((card) => {
        const measurementData = measurements
          .filter(m => m[card.key] !== null)
          .map(m => ({
            value: m[card.key],
            date: formatDate(m.created_at)
          }));

        if (measurementData.length === 0) return null;

        return (
          <GlassCard 
            key={card.key} 
            className="bg-white/40 backdrop-blur-lg border border-green-100"
          >
            <div className="flex flex-col space-y-4">
              <h2 className="text-lg font-medium text-primary/80">{card.title}</h2>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={measurementData}>
                    <XAxis 
                      dataKey="date" 
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                      unit={card.unit}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={card.color}
                      strokeWidth={2}
                      dot={{ fill: card.color }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Senaste: {latest[card.key]}{card.unit}</span>
              </div>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
};
