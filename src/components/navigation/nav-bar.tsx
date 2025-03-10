
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";

export function NavBar() {
  const [open, setOpen] = useState(false);
  const [brandingName, setBrandingName] = useState("FitTracker");
  const [session, setSession] = useState(null);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const isPublicRoute = location.pathname === "/" || location.pathname === "/auth";

  useEffect(() => {
    // Hämta initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Sätt upp auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session && !isPublicRoute) {
        navigate('/auth');
      }
    });

    // Cleanup subscription
    return () => subscription.unsubscribe();
  }, [navigate, isPublicRoute]);

  useEffect(() => {
    const fetchBranding = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // First try to get the coach's branding if the user is a client
        const { data: coachClient } = await supabase
          .from('coach_clients')
          .select('coach_id')
          .eq('client_id', session.user.id)
          .single();

        const coachId = coachClient?.coach_id;

        // Get theme preferences for either the coach or the client's coach
        const { data: themePrefs } = await supabase
          .from('theme_preferences')
          .select('company_name')
          .eq('user_id', coachId || session.user.id)
          .single();

        if (themePrefs?.company_name) {
          setBrandingName(themePrefs.company_name);
        }
      }
    };

    if (!isPublicRoute) {
      fetchBranding();
    } else {
      setBrandingName("FitTracker");
    }
  }, [isPublicRoute, session]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
      navigate('/');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Error",
        description: "There was an error signing out",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed w-full h-16 bg-[#222] border-b border-[#333] z-50">
      <div className="container max-w-7xl mx-auto flex items-center justify-between h-full px-4">
        <Link to="/" className="text-white text-xl font-semibold">
          {brandingName}
        </Link>
        
        {location.pathname === "/" && !session && (
          <Button 
            asChild
            variant="ghost" 
            className="text-gray-400 hover:text-white hover:bg-white/10"
          >
            <Link to="/auth">Sign In</Link>
          </Button>
        )}
        
        {session && !isPublicRoute && (
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex">
              <DesktopNav onSignOut={handleSignOut} />
            </div>
            <div className="md:hidden">
              <MobileNav 
                open={open} 
                onOpenChange={setOpen} 
                onSignOut={handleSignOut} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
