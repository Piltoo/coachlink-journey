
import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function NavBar() {
  const [user, setUser] = React.useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  React.useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
                <Link
                  to="/clients"
                  className="text-primary hover:text-accent hover:bg-secondary px-4 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  Clients
                </Link>
                <Link
                  to="/measurements"
                  className="text-primary hover:text-accent hover:bg-secondary px-4 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  Measurements
                </Link>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="text-primary hover:text-accent hover:bg-secondary"
                >
                  Sign Out
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
