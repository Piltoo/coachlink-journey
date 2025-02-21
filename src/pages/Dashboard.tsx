
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { PaymentsCard } from "@/components/dashboard/PaymentsCard";
import { MissedPaymentsCard } from "@/components/dashboard/MissedPaymentsCard";
import { ClientProgress } from "@/components/dashboard/ClientProgress";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
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

type CheckIn = {
  id: string;
  created_at: string;
  client: {
    full_name: string | null;
    email: string;
  };
  weight_kg: number;
  measurements: {
    waist_cm: number | null;
    chest_cm: number | null;
  }[];
};

const Dashboard = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [sessionRequests, setSessionRequests] = useState<SessionRequest[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!profile) return;
        setUserRole(profile.role);

        if (profile.role === 'coach') {
          // Fetch session requests
          const { data: sessions } = await supabase
            .from('workout_sessions')
            .select(`
              id,
              start_time,
              end_time,
              status,
              client:profiles!workout_sessions_client_id_fkey (
                full_name,
                email
              )
            `)
            .eq('status', 'pending')
            .eq('coach_id', user.id);

          if (sessions) setSessionRequests(sessions);

          // Fetch check-ins
          const { data: checkInsData } = await supabase
            .from('weekly_checkins')
            .select(`
              id,
              created_at,
              weight_kg,
              client:profiles!weekly_checkins_client_id_fkey (
                full_name,
                email
              ),
              measurements (
                waist_cm,
                chest_cm
              )
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(3);

          if (checkInsData) setCheckIns(checkInsData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [toast]);

  const handleSessionResponse = async (sessionId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('workout_sessions')
        .update({ status: approved ? 'approved' : 'rejected' })
        .eq('id', sessionId);

      if (error) throw error;

      setSessionRequests(prev => prev.filter(session => session.id !== sessionId));
      
      toast({
        title: "Success",
        description: `Session ${approved ? 'approved' : 'rejected'} successfully`,
      });
    } catch (error) {
      console.error('Error updating session:', error);
      toast({
        title: "Error",
        description: "Failed to update session",
        variant: "destructive",
      });
    }
  };

  const handleReviewCheckIn = (checkInId: string) => {
    navigate(`/check-ins/${checkInId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-[#1B4332]">Welcome Back</h1>
            <div className="text-sm text-gray-600">
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
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <GlassCard className="p-4">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Today's Assignments</h3>
                <p className="text-4xl font-bold text-[#1B4332]">0</p>
                <p className="text-xs text-gray-500 mt-1">No assignments today</p>
              </GlassCard>

              <GlassCard className="p-4">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Pending Sessions</h3>
                <p className="text-4xl font-bold text-[#1B4332]">{sessionRequests.length}</p>
                <div className="mt-2 max-h-[80px] overflow-y-auto">
                  {sessionRequests.length > 0 ? (
                    sessionRequests.slice(0, 2).map((session) => (
                      <div key={session.id} className="flex items-center justify-between text-xs py-1">
                        <span className="text-gray-600">{session.client.full_name || session.client.email}</span>
                        <div className="flex gap-1">
                          <Button 
                            size="sm"
                            className="h-5 px-2 text-[10px] bg-[#a7cca4] hover:bg-[#96bb93] text-white"
                            onClick={() => handleSessionResponse(session.id, true)}
                          >
                            ✓
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            className="h-5 px-2 text-[10px] border-[#a7cca4] text-[#a7cca4] hover:bg-[#a7cca4]/10"
                            onClick={() => handleSessionResponse(session.id, false)}
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500">No pending sessions</p>
                  )}
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Check-ins</h3>
                <p className="text-4xl font-bold text-[#1B4332]">{checkIns.length}</p>
                <div className="mt-2 max-h-[80px] overflow-y-auto">
                  {checkIns.length > 0 ? (
                    checkIns.map((checkIn) => (
                      <div key={checkIn.id} className="flex items-center justify-between text-xs py-1">
                        <div>
                          <span className="text-gray-600">{checkIn.client.full_name || checkIn.client.email}</span>
                          <br />
                          <span className="text-gray-400">Weight: {checkIn.weight_kg}kg</span>
                        </div>
                        <Button
                          size="sm"
                          className="h-5 px-2 text-[10px] bg-[#a7cca4] hover:bg-[#96bb93] text-white"
                          onClick={() => handleReviewCheckIn(checkIn.id)}
                        >
                          Review
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500">No pending check-ins</p>
                  )}
                </div>
              </GlassCard>

              <MissedPaymentsCard />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
