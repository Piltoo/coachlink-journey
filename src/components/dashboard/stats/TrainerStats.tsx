
import { GlassCard } from "@/components/ui/glass-card";

type TrainerStatsProps = {
  unreadCheckIns: number;
  unreadMessages: number;
};

export const TrainerStats = ({ unreadCheckIns, unreadMessages }: TrainerStatsProps) => {
  return (
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
  );
};
