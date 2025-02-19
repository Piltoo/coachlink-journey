
import { GlassCard } from "@/components/ui/glass-card";

export const StatsCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100">
        <div className="flex flex-col">
          <h2 className="text-lg font-medium text-primary/80 mb-2">Active Clients</h2>
          <p className="text-4xl font-bold text-primary">12</p>
          <span className="text-sm text-accent mt-2">↑ 2 new this week</span>
        </div>
      </GlassCard>
      
      <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100">
        <div className="flex flex-col">
          <h2 className="text-lg font-medium text-primary/80 mb-2">Programs</h2>
          <p className="text-4xl font-bold text-primary">8</p>
          <span className="text-sm text-accent mt-2">↑ 1 new this month</span>
        </div>
      </GlassCard>
      
      <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100">
        <div className="flex flex-col">
          <h2 className="text-lg font-medium text-primary/80 mb-2">Today's Sessions</h2>
          <p className="text-4xl font-bold text-primary">5</p>
          <span className="text-sm text-accent mt-2">Next session in 2h</span>
        </div>
      </GlassCard>
    </div>
  );
};
