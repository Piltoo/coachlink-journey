
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ClientProgress } from "@/components/dashboard/ClientProgress";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";

type UserRole = 'client' | 'coach' | 'operator';

const Dashboard = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firstName, setFirstName] = useState<string>("");
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
  const [needsAssessment, setNeedsAssessment] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error("Error fetching user:", userError);
          navigate('/auth');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, first_name, has_changed_password, has_completed_assessment')
          .eq('id', user.id)
          .single();

        if (profileError || !profile) {
          console.error("Error fetching profile:", profileError);
          toast({
            title: "Profile Error",
            description: "Failed to load user profile",
            variant: "destructive",
          });
          return;
        }

        const roleType = profile.role.toLowerCase() as UserRole;
        
        // Om användaren är en klient, kontrollera onboarding-status
        if (roleType === 'client') {
          if (!profile.has_changed_password) {
            setNeedsPasswordChange(true);
          } else if (!profile.has_completed_assessment) {
            setNeedsAssessment(true);
            navigate('/health-assessment');
          }
        }

        setUserRole(roleType);
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
  }, [toast, navigate]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      // Uppdatera profilen för att markera att lösenordet har ändrats
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ has_changed_password: true })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Password changed successfully",
      });

      setNeedsPasswordChange(false);
      navigate('/health-assessment');
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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

  if (needsPasswordChange) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50 flex items-center justify-center px-4">
        <GlassCard className="w-full max-w-md p-8">
          <h2 className="text-2xl font-bold text-primary text-center mb-6">
            Change Your Password
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            Please change your password to continue
          </p>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full">
              Change Password
            </Button>
          </form>
        </GlassCard>
      </div>
    );
  }

  const renderDashboardContent = () => {
    switch (userRole) {
      case 'client':
        return (
          <div className="space-y-6">
            <ClientProgress />
          </div>
        );
      case 'coach':
        return <StatsCards />;
      case 'operator':
        return (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Operator Dashboard</h2>
            <p className="text-gray-600">Welcome to the operator dashboard. Operator-specific features coming soon.</p>
          </div>
        );
      default:
        return (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-red-600">Invalid User Role</h2>
            <p className="text-gray-600">Please contact support to update your profile.</p>
          </div>
        );
    }
  };

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
