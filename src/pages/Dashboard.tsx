
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { BookSessionDialog } from "@/components/sessions/BookSessionDialog";
import { PaymentsCard } from "@/components/dashboard/PaymentsCard";

type UserRole = 'client' | 'trainer' | 'admin';

const Dashboard = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [coachId, setCoachId] = useState<string | null>(null);
  const { toast } = useToast();

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

      if (profile.role === 'client') {
        const { data: coachClient } = await supabase
          .from('coach_clients')
          .select('coach_id')
          .eq('client_id', user.id)
          .single();

        if (coachClient) {
          setCoachId(coachClient.coach_id);
        }
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-primary">Welcome Back</h1>
            <div className="flex items-center gap-4">
              {userRole === 'client' && coachId && (
                <BookSessionDialog coachId={coachId} />
              )}
              <div className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>

          <StatsCards />
          
          {userRole === 'trainer' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PaymentsCard />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
