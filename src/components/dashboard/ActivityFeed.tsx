
import { GlassCard } from "@/components/ui/glass-card";

export const ActivityFeed = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100 p-6">
        <h3 className="text-xl font-semibold text-primary mb-4">Upcoming Sessions</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
            <div>
              <p className="font-medium text-primary">Sarah Johnson</p>
              <p className="text-sm text-muted-foreground">Strength Training</p>
            </div>
            <div className="text-right">
              <p className="text-accent">2:00 PM</p>
              <p className="text-sm text-muted-foreground">Today</p>
            </div>
          </div>
          <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
            <div>
              <p className="font-medium text-primary">Mike Peters</p>
              <p className="text-sm text-muted-foreground">HIIT Session</p>
            </div>
            <div className="text-right">
              <p className="text-accent">4:30 PM</p>
              <p className="text-sm text-muted-foreground">Today</p>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100 p-6">
        <h3 className="text-xl font-semibold text-primary mb-4">Recent Activities</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-primary">New Program Created</p>
              <p className="text-sm text-muted-foreground">Advanced Weight Loss - 12 Weeks</p>
            </div>
            <span className="text-sm text-muted-foreground">2h ago</span>
          </div>
          <div className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-primary">Client Milestone</p>
              <p className="text-sm text-muted-foreground">Emma reached her weight goal</p>
            </div>
            <span className="text-sm text-muted-foreground">1d ago</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
