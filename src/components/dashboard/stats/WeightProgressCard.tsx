
import { GlassCard } from "@/components/ui/glass-card";
import { Progress } from "@/components/ui/progress";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type WeightProgressCardProps = {
  recentWeight: {
    weight_kg: number;
    created_at: string;
  } | null;
  targetWeight: number;
};

export const WeightProgressCard = ({ recentWeight, targetWeight }: WeightProgressCardProps) => {
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

  return (
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
  );
};
