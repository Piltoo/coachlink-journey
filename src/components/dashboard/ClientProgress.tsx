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
};

type MeasurementCard = {
  title: string;
  key: keyof Omit<Measurement, 'created_at' | 'neck_cm'>;
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

  const calculateBodyFat = (measurement: Measurement | null) => {
    if (!measurement || !measurement.waist_cm || !measurement.neck_cm) {
      return null;
    }
    
    // Navy Body Fat Formula för män
    // 86.010 × log10(midja - nacke) - 70.041 × log10(längd) + 36.76
    
    // Vi antar en genomsnittlig längd på 180cm tills vi har en kolumn för det
    const height = 180;
    const waist = measurement.waist_cm;
    const neck = measurement.neck_cm;
    
    const bodyFat = 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
    
    // Avrunda till en decimal och säkerställ att resultatet är mellan 2-45%
    return Math.min(Math.max(Math.round(bodyFat * 10) / 10, 2), 45);
  };

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

  const bodyFatPercentage = calculateBodyFat(latest);

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
              <span>Mål: {healthAssessment.target_weight}kg</span>
            </div>
            <Progress value={weightProgress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {weightProgress.toFixed(1)}% framsteg mot målet
            </p>
            {bodyFatPercentage && (
              <div className="mt-4 p-3 bg-green-50 rounded-md">
                <h3 className="text-sm font-medium text-primary/80 mb-1">Beräknad kroppsfett</h3>
                <p className="text-2xl font-bold text-primary">
                  {bodyFatPercentage}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Baserat på Navy Body Fat Formula
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
