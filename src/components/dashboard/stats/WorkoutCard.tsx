
import { GlassCard } from "@/components/ui/glass-card";

export const WorkoutCard = () => {
  return (
    <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100">
      <div className="flex flex-col">
        <h2 className="text-sm font-medium text-primary/80 mb-1">Completed Workouts</h2>
        <p className="text-2xl font-bold text-primary">8</p>
        <span className="text-xs text-accent mt-1">This month</span>
      </div>
    </GlassCard>
  );
};
