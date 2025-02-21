
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { PaymentsCard } from "@/components/dashboard/PaymentsCard";
import { MissedPaymentsCard } from "@/components/dashboard/MissedPaymentsCard";
import { ClientProgress } from "@/components/dashboard/ClientProgress";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useNavigate } from "react-router-dom";

type UserRole = 'client' | 'coach' | 'admin';

type SessionRequest = {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  client: {
    full_name: string | null;
    email: string;
  };
};

const Dashboard = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [sessionRequests, setSessionRequests] = useState<SessionRequest[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log("Current user:", user);
      
      if (!user) {
        console.log("No user found");
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      console.log("User profile:", profile, "Error:", error);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        });
        return;
      }

      setUserRole(profile.role as UserRole);

      if (profile.role === 'coach') {
        const { data: sessions, error: sessionsError } = await supabase
          .from('workout_sessions')
          .select(`
            id,
            start_time,
            end_time,
            status,
            client_id,
            client_profile:profiles!workout_sessions_client_id_fkey (
              full_name,
              email
            )
          `)
          .eq('coach_id', user.id)
          .eq('status', 'pending')
          .order('start_time', { ascending: true });

        console.log("Session requests:", sessions, "Error:", sessionsError);

        if (sessionsError) {
          console.error('Sessions error:', sessionsError);
          toast({
            title: "Error",
            description: "Failed to load session requests",
            variant: "destructive",
          });
        } else {
          const formattedSessions: SessionRequest[] = (sessions || []).map(session => ({
            id: session.id,
            start_time: session.start_time,
            end_time: session.end_time,
            status: session.status,
            client: {
              full_name: session.client_profile?.full_name,
              email: session.client_profile?.email
            }
          }));
          console.log("Formatted sessions:", formattedSessions);
          setSessionRequests(formattedSessions);
        }
      }
    };

    fetchUserData();
  }, [toast]);

  const handleSessionResponse = async (sessionId: string, approved: boolean) => {
    const { error } = await supabase
      .from('workout_sessions')
      .update({ status: approved ? 'confirmed' : 'cancelled' })
      .eq('id', sessionId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update session status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Session ${approved ? 'approved' : 'declined'} successfully`,
      });
      // Refresh session requests
      setSessionRequests(prev => prev.filter(session => session.id !== sessionId));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-primary">Welcome Back</h1>
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          <StatsCards />
          
          {userRole === 'client' && (
            <ClientProgress />
          )}
          
          {userRole === 'coach' && (
            <>
              <GlassCard>
                <h2 className="text-lg font-semibold text-primary mb-4">Pending Session Requests</h2>
                {sessionRequests.length > 0 ? (
                  <div className="space-y-3">
                    {sessionRequests.map((session) => (
                      <div key={session.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{session.client.full_name || session.client.email}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(session.start_time).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm"
                              variant="default"
                              className="h-8 px-3 text-xs"
                              onClick={() => handleSessionResponse(session.id, true)}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="sm"
                              variant="outline"
                              className="h-8 px-3 text-xs"
                              onClick={() => handleSessionResponse(session.id, false)}
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground text-sm py-2">No pending session requests</p>
                )}
              </GlassCard>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PaymentsCard />
                <MissedPaymentsCard />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
