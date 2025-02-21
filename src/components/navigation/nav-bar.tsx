
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";

export function NavBar() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

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
        <DesktopNav onSignOut={handleSignOut} />
        <MobileNav 
          open={open} 
          onOpenChange={setOpen} 
          onSignOut={handleSignOut} 
        />
      </div>
    </div>
  );
}
