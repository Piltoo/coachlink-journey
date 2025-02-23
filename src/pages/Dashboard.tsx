
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ClientProgress } from "@/components/dashboard/ClientProgress";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Skeleton } from "@/components/ui/skeleton";

type UserProfile = 'client' | 'coach' | 'operator' | 'therapist';

const Dashboard = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
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

        // Debug: Log the full profile query
        const profileQuery = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        console.log("Full profile data:", profileQuery);

        if (profileQuery.error) {
          console.error("Error fetching profile:", profileQuery.error);
          toast({
            title: "Profile Error",
            description: "Failed to load user profile. Please try refreshing the page.",
            variant: "destructive",
          });
          return;
        }

        const profile = profileQuery.data;

        if (!profile) {
          console.error("No profile found for user");
          toast({
            title: "Profile Error",
            description: "User profile not found. Please contact support.",
            variant: "destructive",
          });
          return;
        }

        // Debug: Log the raw profile data
        console.log("Raw profile data:", profile);
        console.log("User profile value:", profile.user_profile);
        
        // Validate that user_profile is one of the expected values
        const validProfiles: UserProfile[] = ['client', 'coach', 'operator', 'therapist'];
        const userProfileValue = profile.user_profile?.toLowerCase() as UserProfile;
        
        if (!validProfiles.includes(userProfileValue)) {
          console.error("Invalid user profile type:", userProfileValue);
          toast({
            title: "Profile Error",
            description: `Invalid profile type: ${profile.user_profile}. Please contact support.`,
            variant: "destructive",
          });
          return;
        }

        console.log("Profile loaded:", { userProfile: userProfileValue, firstName: profile.first_name });
        
        setUserProfile(userProfileValue);
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

  const renderDashboardContent = () => {
    switch (userProfile) {
      case 'client':
        return <ClientProgress />;
      case 'coach':
        return <StatsCards />;
      case 'operator':
        return (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Operator Dashboard</h2>
            <p className="text-gray-600">Welcome to the operator dashboard. Operator-specific features coming soon.</p>
          </div>
        );
      case 'therapist':
        return (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Therapist Dashboard</h2>
            <p className="text-gray-600">Welcome to the therapist dashboard. Therapist-specific features coming soon.</p>
          </div>
        );
      default:
        return (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-red-600">Invalid User Profile</h2>
            <p className="text-gray-600">Please contact support to update your profile.</p>
          </div>
        );
    }
  };

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
          {renderDashboardContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
