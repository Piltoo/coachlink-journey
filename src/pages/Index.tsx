
import { Link } from "react-router-dom";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-8 animate-fade-in">
          <h1 className="text-5xl font-bold text-primary tracking-tight">
            Transform Your Coaching Business
          </h1>
          <p className="text-xl text-primary/80 max-w-3xl mx-auto">
            Streamline your personal training business with our all-in-one platform
            for coaches and clients.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              asChild
              className="bg-accent hover:bg-accent/90 text-white px-8 py-6 rounded-lg text-lg transition-all duration-200 ease-in-out transform hover:scale-105"
            >
              <Link to="/dashboard">Get Started</Link>
            </Button>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <GlassCard className="text-center bg-white/20">
            <h3 className="text-xl font-semibold mb-4 text-primary">Client Management</h3>
            <p className="text-primary/80">
              Easily manage your clients, their programs, and track their progress
              in one place.
            </p>
          </GlassCard>
          <GlassCard className="text-center bg-white/20">
            <h3 className="text-xl font-semibold mb-4 text-primary">Training Programs</h3>
            <p className="text-primary/80">
              Create and customize training programs tailored to each client's
              needs.
            </p>
          </GlassCard>
          <GlassCard className="text-center bg-white/20">
            <h3 className="text-xl font-semibold mb-4 text-primary">Progress Tracking</h3>
            <p className="text-primary/80">
              Track and visualize client progress with detailed analytics and
              reports.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Index;
