
import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { MessageCircle, Dumbbell, Settings2, LogOut, Home, Users, Ruler } from "lucide-react";

type UserRole = 'client' | 'trainer' | 'admin';

export function NavBar() {
  const [user, setUser] = React.useState(null);
  const [userRole, setUserRole] = React.useState<UserRole | null>(null);
  const [companyName, setCompanyName] = React.useState("FitCoach");
  const navigate = useNavigate();
  const { toast } = useToast();

  React.useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchUserRole(session.user.id);
        fetchCompanyName(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchUserRole(session.user.id);
        fetchCompanyName(session.user.id);
      } else {
        setUserRole(null);
        setCompanyName("FitCoach");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
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
  };

  const fetchCompanyName = async (userId: string) => {
    // If user is a client, fetch their coach's theme preferences
    if (userRole === 'client') {
      const { data: relationship } = await supabase
        .from('coach_clients')
        .select('coach_id')
        .eq('client_id', userId)
        .single();

      if (relationship) {
        const { data: themePrefs } = await supabase
          .from('theme_preferences')
          .select('company_name')
          .eq('user_id', relationship.coach_id)
          .single();

        if (themePrefs?.company_name) {
          setCompanyName(themePrefs.company_name);
        }
      }
    } else {
      // For trainers, fetch their own theme preferences
      const { data: themePrefs } = await supabase
        .from('theme_preferences')
        .select('company_name')
        .eq('user_id', userId)
        .single();

      if (themePrefs?.company_name) {
        setCompanyName(themePrefs.company_name);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
      toast({
        title: "Signed out successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-white/60 backdrop-blur-xl border-b border-green-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className="text-xl font-bold text-primary hover:text-accent transition-colors"
            >
              {companyName}
            </Link>
          </div>
          <div className="flex items-center space-x-1">
            {user ? (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className="text-primary hover:text-accent hover:bg-secondary p-2 h-10 w-10"
                  size="icon"
                  title="Dashboard"
                >
                  <Link to="/dashboard">
                    <Home className="h-4 w-4" />
                  </Link>
                </Button>
                {userRole === 'trainer' && (
                  <>
                    <Button
                      asChild
                      variant="ghost"
                      className="text-primary hover:text-accent hover:bg-secondary p-2 h-10 w-10"
                      size="icon"
                      title="Clients"
                    >
                      <Link to="/clients">
                        <Users className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      className="text-primary hover:text-accent hover:bg-secondary p-2 h-10 w-10"
                      size="icon"
                      title="Nutrition & Training"
                    >
                      <Link to="/nutrition-training">
                        <Dumbbell className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      className="text-primary hover:text-accent hover:bg-secondary p-2 h-10 w-10"
                      size="icon"
                      title="Settings"
                    >
                      <Link to="/settings">
                        <Settings2 className="h-4 w-4" />
                      </Link>
                    </Button>
                  </>
                )}
                {userRole === 'client' && (
                  <>
                    <Button
                      asChild
                      variant="ghost"
                      className="text-primary hover:text-accent hover:bg-secondary p-2 h-10 w-10"
                      size="icon"
                      title="Workout Plan"
                    >
                      <Link to="/program">
                        <Dumbbell className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      className="text-primary hover:text-accent hover:bg-secondary p-2 h-10 w-10"
                      size="icon"
                      title="Measurements"
                    >
                      <Link to="/measurements">
                        <Ruler className="h-4 w-4" />
                      </Link>
                    </Button>
                  </>
                )}
                <Button
                  asChild
                  variant="ghost"
                  className="text-primary hover:text-accent hover:bg-secondary p-2 h-10 w-10"
                  size="icon"
                  title="Messages"
                >
                  <Link to="/messages">
                    <MessageCircle className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="text-primary hover:text-accent hover:bg-secondary p-2 h-10 w-10"
                  size="icon"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                asChild
                variant="ghost"
                className="text-primary hover:text-accent hover:bg-secondary"
              >
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
