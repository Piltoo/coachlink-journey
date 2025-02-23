
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ClientProgress } from "@/components/dashboard/ClientProgress";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

const Dashboard = () => {
  const [isCoach, setIsCoach] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
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

        // Check if user is a coach using the is_coach function
        const { data: coachStatus, error: coachError } = await supabase
          .rpc('is_coach', { user_id: user.id });

        if (coachError) {
          console.error("Error checking coach status:", coachError);
          return;
        }

        // Fetch profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          return;
        }

        setIsCoach(coachStatus || false);
        setFirstName(profile?.first_name || "");
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          <DashboardHeader firstName={firstName} />
          {isCoach ? <StatsCards /> : <ClientProgress />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
