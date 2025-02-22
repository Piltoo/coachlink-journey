
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ClientProgress } from "@/components/dashboard/ClientProgress";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

type UserRole = 'client' | 'coach' | 'admin';

const Dashboard = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [firstName, setFirstName] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log("No user found");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_role, first_name')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          return;
        }

        if (!profile) {
          console.log("No profile found");
          return;
        }
        
        setUserRole(profile.user_role as UserRole);
        setFirstName(profile.first_name || "");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          <DashboardHeader firstName={firstName} />
          <StatsCards />
          {userRole === 'client' && <ClientProgress />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
