
import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { MessageCircle, Dumbbell, Settings2, LogOut } from "lucide-react";

type UserRole = 'client' | 'trainer' | 'admin';

export function NavBar() {
  const [user, setUser] = React.useState(null);
  const [userRole, setUserRole] = React.useState<UserRole | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  React.useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setUserRole(null);
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
              FitCoach
            </Link>
          </div>
          <div className="flex items-center space-x-1">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-primary hover:text-accent hover:bg-secondary px-4 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  Dashboard
                </Link>
                {userRole === 'trainer' && (
                  <>
                    <Link
                      to="/clients"
                      className="text-primary hover:text-accent hover:bg-secondary px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    >
                      Clients
                    </Link>
                    <Link
                      to="/nutrition-training"
                      className="text-primary hover:text-accent hover:bg-secondary px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                    >
                      <Dumbbell className="h-4 w-4" />
                      Nutrition & Training
                    </Link>
                    <Link
                      to="/settings"
                      className="text-primary hover:text-accent hover:bg-secondary px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                    >
                      <Settings2 className="h-4 w-4" />
                      Settings
                    </Link>
                  </>
                )}
                {userRole === 'client' && (
                  <>
                    <Link
                      to="/program"
                      className="text-primary hover:text-accent hover:bg-secondary px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    >
                      Program
                    </Link>
                    <Link
                      to="/measurements"
                      className="text-primary hover:text-accent hover:bg-secondary px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    >
                      Measurements
                    </Link>
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
