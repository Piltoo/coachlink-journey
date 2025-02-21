
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";

export function NavBar() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const isPublicRoute = location.pathname === "/" || location.pathname === "/auth";

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        title: "Error",
        description: "There was an error signing out",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
    }
  };

  return (
    <div className="fixed w-full h-16 bg-[#222] border-b border-[#333] z-50">
      <div className="container max-w-7xl mx-auto flex items-center justify-between h-full px-4">
        <Link to="/" className="text-white text-xl font-semibold">
          FitTracker
        </Link>
        
        {location.pathname === "/" && (
          <Button 
            asChild
            variant="ghost" 
            className="text-gray-400 hover:text-white hover:bg-white/10"
          >
            <Link to="/auth">Sign In</Link>
          </Button>
        )}
        
        {!isPublicRoute && (
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
