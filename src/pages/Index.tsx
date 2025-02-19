
import { Link } from "react-router-dom";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, Dumbbell, Trophy } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100/30 to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="flex flex-col lg:flex-row items-center gap-12 mb-16">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
              <Trophy className="w-4 h-4 mr-2" />
              Trusted by 1000+ fitness professionals
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-primary leading-tight">
              Manage Your Fitness Business<br />
              <span className="text-accent">All in One Platform</span>
            </h1>
            <p className="text-lg text-primary/80 max-w-xl">
              Everything you need to manage clients, create programs, and grow your fitness business - in one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                asChild
                size="lg"
                className="bg-accent hover:bg-accent/90 text-white rounded-lg text-base font-medium"
              >
                <Link to="/dashboard">Launch Platform</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-accent text-accent hover:bg-accent hover:text-white rounded-lg text-base font-medium"
              >
                <Link to="/programs">View Features</Link>
              </Button>
            </div>
          </div>
          <div className="flex-1">
            <img 
              src="/placeholder.svg" 
              alt="Platform Preview" 
              className="w-full max-w-xl rounded-lg shadow-2xl border border-green-100/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="p-8 bg-white/40 backdrop-blur-lg border border-green-100 hover:shadow-lg transition-all duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-primary">Unified Dashboard</h3>
              <p className="text-primary/70">
                Access all your client data, programs, and business metrics in one centralized location.
              </p>
            </div>
          </GlassCard>

          <GlassCard className="p-8 bg-white/40 backdrop-blur-lg border border-green-100 hover:shadow-lg transition-all duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-primary">Client Management</h3>
              <p className="text-primary/70">
                Track progress, manage communications, and store client information securely.
              </p>
            </div>
          </GlassCard>

          <GlassCard className="p-8 bg-white/40 backdrop-blur-lg border border-green-100 hover:shadow-lg transition-all duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-primary">Program Builder</h3>
              <p className="text-primary/70">
                Create and customize professional training programs with our intuitive builder.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Index;
