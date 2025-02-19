import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { addHours, subDays } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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

        // Trainer specific data fetching
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

  const calculateWeightProgress = () => {
    if (!recentWeight) return 0;
    const initialWeight = 85; // Starting weight
    const current = recentWeight.weight_kg;
    const target = targetWeight;
    
    if (initialWeight === target) return 100;
    return Math.min(100, Math.max(0, 
      ((initialWeight - current) / (initialWeight - target)) * 100
    ));
  };

  const renderMeasurementCard = (title: string, measurementKey: keyof MeasurementsData) => {
    const data = measurementsHistory.map(m => ({
      value: m[measurementKey],
      date: new Date(m.created_at).toLocaleDateString()
    })).filter(d => d.value !== null);

    return (
      <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100">
        <div className="flex flex-col h-[150px]">
          <h2 className="text-sm font-medium text-primary/80 mb-1">{title}</h2>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  domain={['auto', 'auto']}
                  width={25}
                />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#2D6A4F" 
                  fill="#95D5B2" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-muted-foreground">No measurement data recorded</p>
          )}
        </div>
      </GlassCard>
    );
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {userRole === 'trainer' && (
        <>
          <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100">
            <div className="flex flex-col">
              <h2 className="text-sm font-medium text-primary/80 mb-1">Active Clients</h2>
              <p className="text-2xl font-bold text-primary">12</p>
              <span className="text-xs text-accent mt-1">↑ 2 new this week</span>
            </div>
          </GlassCard>

          <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100">
            <div className="flex flex-col">
              <h2 className="text-sm font-medium text-primary/80 mb-1">Pending Check-ins</h2>
              <p className="text-2xl font-bold text-primary">{unreadCheckIns}</p>
              <span className="text-xs text-accent mt-1">Requires review</span>
            </div>
          </GlassCard>

          <GlassCard className="bg-white/40 backdrop-blur-lg border border-blue-100">
            <div className="flex flex-col">
              <h2 className="text-sm font-medium text-primary/80 mb-1">Unread Messages</h2>
              <p className="text-2xl font-bold text-primary">{unreadMessages}</p>
              <span className="text-xs text-accent mt-1">New messages</span>
            </div>
          </GlassCard>
        </>
      )}
      {userRole === 'client' && (
        <>
          <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100">
            <div className="flex flex-col">
              <h2 className="text-sm font-medium text-primary/80 mb-1">Completed Workouts</h2>
              <p className="text-2xl font-bold text-primary">8</p>
              <span className="text-xs text-accent mt-1">This month</span>
            </div>
          </GlassCard>

          <GlassCard className="col-span-3 bg-white/40 backdrop-blur-lg border border-green-100">
            <div className="flex flex-col">
              <h2 className="text-sm font-medium text-primary/80 mb-1">Weight Progress</h2>
              {recentWeight ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-lg font-semibold">{recentWeight.weight_kg}kg</p>
                    <span className="text-xs text-accent">
                      {calculateWeightProgress().toFixed(1)}% to goal
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Progress value={calculateWeightProgress()} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Start: 85kg</span>
                      <span>Current: {recentWeight.weight_kg}kg</span>
                      <span>Target: {targetWeight}kg</span>
                    </div>
                  </div>
                  <div className="mt-4 h-[60px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { value: 85, date: 'Start' },
                        { value: recentWeight.weight_kg, date: 'Current' },
                        { value: targetWeight, date: 'Goal' }
                      ]}>
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} width={25} />
                        <Area type="monotone" dataKey="value" stroke="#2D6A4F" fill="#95D5B2" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">No weight data recorded yet</p>
              )}
            </div>
          </GlassCard>

          {renderMeasurementCard("Waist", "waist_cm")}
          {renderMeasurementCard("Hips", "hips_cm")}
          {renderMeasurementCard("Thigh", "thigh_cm")}
          {renderMeasurementCard("Arm", "arm_cm")}
        </>
      )}
    </div>
  );
};
