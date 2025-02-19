
import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { WeeklyCheckInForm } from "@/components/check-ins/WeeklyCheckInForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type UserRole = 'client' | 'trainer' | 'admin';

const Dashboard = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        });
        return;
      }

      setUserRole(profile.role as UserRole);

      // If user is a trainer, fetch recent check-ins
      if (profile.role === 'trainer') {
        const { data: checkIns, error: checkInsError } = await supabase
          .from('weekly_checkins')
          .select(`
            *,
            profiles:client_id (full_name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (checkInsError) {
          toast({
            title: "Error",
            description: "Failed to load recent check-ins",
            variant: "destructive",
          });
          return;
        }

        setRecentCheckIns(checkIns);
      }
    };

    fetchUserRole();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-primary">Welcome Back</h1>
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          
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

          {userRole === 'client' && <WeeklyCheckInForm />}

          {userRole === 'trainer' && (
            <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100 p-6">
              <h3 className="text-xl font-semibold text-primary mb-4">Recent Client Check-ins</h3>
              <div className="space-y-4">
                {recentCheckIns.map((checkIn) => (
                  <div key={checkIn.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div>
                      <p className="font-medium text-primary">{checkIn.profiles.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Weight: {checkIn.weight_kg}kg
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-accent">
                        {new Date(checkIn.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Check-in Complete</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
