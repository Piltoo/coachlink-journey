
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

type UserRole = 'client' | 'trainer' | 'admin';

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

type CheckIn = {
  id: string;
  created_at: string;
  weight_kg: number;
  status: string;
  client: {
    full_name: string | null;
    email: string;
  };
};

const Dashboard = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [sessionRequests, setSessionRequests] = useState<SessionRequest[]>([]);
  const [pendingCheckIns, setPendingCheckIns] = useState<CheckIn[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
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

      // Fetch session requests and check-ins for trainers
      if (profile.role === 'trainer') {
        // Fetch pending session requests with client profile information
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

        if (sessionsError) {
          console.error('Sessions error:', sessionsError);
          toast({
            title: "Error",
            description: "Failed to load session requests",
            variant: "destructive",
          });
        } else {
          // Transform the data to match the SessionRequest type
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
          setSessionRequests(formattedSessions);
        }

        // Fetch pending check-ins with client profile information
        const { data: checkIns, error: checkInsError } = await supabase
          .from('weekly_checkins')
          .select(`
            id,
            created_at,
            weight_kg,
            status,
            client_profile:profiles!weekly_checkins_client_id_fkey (
              full_name,
              email
            )
          `)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (checkInsError) {
          console.error('Check-ins error:', checkInsError);
          toast({
            title: "Error",
            description: "Failed to load check-ins",
            variant: "destructive",
          });
        } else {
          // Transform the data to match the CheckIn type
          const formattedCheckIns: CheckIn[] = (checkIns || []).map(checkIn => ({
            id: checkIn.id,
            created_at: checkIn.created_at,
            weight_kg: checkIn.weight_kg,
            status: checkIn.status,
            client: {
              full_name: checkIn.client_profile?.full_name,
              email: checkIn.client_profile?.email
            }
          }));
          setPendingCheckIns(formattedCheckIns);
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

  const handleCheckInClick = (checkInId: string) => {
    navigate(`/check-ins/${checkInId}`);
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
          
          {userRole === 'trainer' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100 p-6">
                  <h2 className="text-xl font-semibold text-primary mb-4">Pending Session Requests</h2>
                  <div className="space-y-4">
                    {sessionRequests.map((session) => (
                      <div key={session.id} className="p-4 bg-white/60 rounded-lg space-y-2">
                        <p className="font-medium">{session.client.full_name || session.client.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.start_time).toLocaleString()}
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            variant="default"
                            onClick={() => handleSessionResponse(session.id, true)}
                          >
                            Approve
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleSessionResponse(session.id, false)}
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))}
                    {sessionRequests.length === 0 && (
                      <p className="text-center text-muted-foreground">No pending session requests</p>
                    )}
                  </div>
                </GlassCard>

                <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-primary">Unread Check-ins</h2>
                    {pendingCheckIns.length > 0 && (
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                        {pendingCheckIns.length}
                      </span>
                    )}
                  </div>
                  <div className="space-y-4">
                    {pendingCheckIns.map((checkIn) => (
                      <div 
                        key={checkIn.id} 
                        className="p-4 bg-white/60 rounded-lg space-y-2 cursor-pointer hover:bg-white/80 transition-colors border-l-4 border-primary"
                        onClick={() => handleCheckInClick(checkIn.id)}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{checkIn.client.full_name || checkIn.client.email}</p>
                          <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded-full">
                            Unread
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Submitted: {new Date(checkIn.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm">Weight: {checkIn.weight_kg}kg</p>
                      </div>
                    ))}
                    {pendingCheckIns.length === 0 && (
                      <p className="text-center text-muted-foreground">No unread check-ins</p>
                    )}
                  </div>
                </GlassCard>
              </div>

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
