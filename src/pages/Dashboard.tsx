import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ClientProgress } from "@/components/dashboard/ClientProgress";
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
        .update({ status: approved ? 'confirmed' : 'cancelled' })
        .eq('id', sessionId);

      if (error) throw error;

      setSessionRequests(prev => prev.filter(session => session.id !== sessionId));
      
      toast({
        title: "Success",
        description: `Session ${approved ? 'confirmed' : 'cancelled'} successfully`,
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
