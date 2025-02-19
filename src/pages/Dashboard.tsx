
import { GlassCard } from "@/components/ui/glass-card";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GlassCard>
              <h2 className="text-xl font-semibold mb-4">Active Clients</h2>
              <p className="text-3xl font-bold text-accent">12</p>
            </GlassCard>
            <GlassCard>
              <h2 className="text-xl font-semibold mb-4">Programs</h2>
              <p className="text-3xl font-bold text-accent">8</p>
            </GlassCard>
            <GlassCard>
              <h2 className="text-xl font-semibold mb-4">Today's Sessions</h2>
              <p className="text-3xl font-bold text-accent">5</p>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
