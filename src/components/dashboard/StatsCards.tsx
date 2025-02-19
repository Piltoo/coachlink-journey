
import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { addHours } from "date-fns";

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
  const [targetWeight, setTargetWeight] = useState<number>(75); // Mock target weight
  const [recentMeasurements, setRecentMeasurements] = useState<MeasurementsData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user role and data
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserRole(profile.role);

        if (profile.role === 'client') {
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

          // Fetch most recent measurements
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
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (measurementsData) {
            setRecentMeasurements(measurementsData);
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
    const initialWeight = 85; // Mock initial weight
    const current = recentWeight.weight_kg;
    const target = targetWeight;
    
    if (initialWeight === target) return 100;
    return Math.min(100, Math.max(0, 
      ((initialWeight - current) / (initialWeight - target)) * 100
    ));
  };

  const renderMeasurementCard = (title: string, value: number | null, unit: string) => {
    return (
      <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100">
        <div className="flex flex-col">
          <h2 className="text-lg font-medium text-primary/80 mb-2">{title}</h2>
          {value ? (
            <>
              <p className="text-2xl font-bold text-primary">{value}{unit}</p>
              <span className="text-sm text-accent mt-2">
                Last updated: {recentMeasurements?.created_at ? new Date(recentMeasurements.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No measurement recorded</p>
          )}
        </div>
      </GlassCard>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {userRole === 'trainer' && (
        <>
          <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100">
            <div className="flex flex-col">
              <h2 className="text-lg font-medium text-primary/80 mb-2">Active Clients</h2>
              <p className="text-4xl font-bold text-primary">12</p>
              <span className="text-sm text-accent mt-2">↑ 2 new this week</span>
            </div>
          </GlassCard>

          <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100">
            <div className="flex flex-col">
              <h2 className="text-lg font-medium text-primary/80 mb-2">Pending Check-ins</h2>
              <p className="text-4xl font-bold text-primary">{unreadCheckIns}</p>
              <span className="text-sm text-accent mt-2">Requires your review</span>
            </div>
          </GlassCard>

          <GlassCard className="bg-white/40 backdrop-blur-lg border border-blue-100">
            <div className="flex flex-col">
              <h2 className="text-lg font-medium text-primary/80 mb-2">Unread Messages</h2>
              <p className="text-4xl font-bold text-primary">{unreadMessages}</p>
              <span className="text-sm text-accent mt-2">New messages</span>
            </div>
          </GlassCard>
        </>
      )}
      {userRole === 'client' && (
        <>
          <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100">
            <div className="flex flex-col">
              <h2 className="text-lg font-medium text-primary/80 mb-2">Completed Workouts</h2>
              <p className="text-4xl font-bold text-primary">8</p>
              <span className="text-sm text-accent mt-2">This month</span>
            </div>
          </GlassCard>

          <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100">
            <div className="flex flex-col">
              <h2 className="text-lg font-medium text-primary/80 mb-2">Weight Progress</h2>
              {recentWeight ? (
                <>
                  <p className="text-xl font-semibold mb-2">{recentWeight.weight_kg}kg</p>
                  <div className="space-y-2">
                    <Progress value={calculateWeightProgress()} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span>Current: {recentWeight.weight_kg}kg</span>
                      <span>Target: {targetWeight}kg</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {calculateWeightProgress().toFixed(1)}% to goal
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No weight data recorded yet</p>
              )}
            </div>
          </GlassCard>

          {renderMeasurementCard("Waist", recentMeasurements?.waist_cm, "cm")}
          {renderMeasurementCard("Chest", recentMeasurements?.chest_cm, "cm")}
          {renderMeasurementCard("Hips", recentMeasurements?.hips_cm, "cm")}
          {renderMeasurementCard("Thigh", recentMeasurements?.thigh_cm, "cm")}
          {renderMeasurementCard("Arm", recentMeasurements?.arm_cm, "cm")}
        </>
      )}
    </div>
  );
};
