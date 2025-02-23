
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ClientProgress } from "@/components/dashboard/ClientProgress";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const [isCoach, setIsCoach] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [firstName, setFirstName] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("Error fetching user:", userError);
          toast({
            title: "Authentication Error",
            description: "Please try logging in again",
            variant: "destructive",
          });
          return;
        }

        if (!user) {
          toast({
            title: "Error",
            description: "No user found. Please log in again.",
            variant: "destructive",
          });
          return;
        }

        console.log("Fetching profile for user:", user.id);

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, user_profile, email')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          toast({
            title: "Profile Error",
            description: "Failed to load user profile. Please try refreshing the page.",
            variant: "destructive",
          });
          return;
        }

        if (!profile) {
          console.error("No profile found for user");
          toast({
            title: "Profile Error",
            description: "User profile not found. Please contact support.",
            variant: "destructive",
          });
          return;
        }

        console.log("Profile loaded:", { userProfile: profile.user_profile, firstName: profile.first_name });
        
        setIsCoach(profile.user_profile === 'coach');
        setFirstName(profile.first_name || "");
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-[250px]" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[200px] md:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          <DashboardHeader firstName={firstName} />
          {isCoach ? (
            <StatsCards />
          ) : (
            <ClientProgress />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
