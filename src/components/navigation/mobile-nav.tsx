
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, ClipboardCheck, Dumbbell, MessageSquare, Settings, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignOut: () => void;
}

export function MobileNav({ open, onOpenChange, onSignOut }: MobileNavProps) {
  const [canCheckIn, setCanCheckIn] = useState(true);

  useEffect(() => {
    async function checkCanSubmit() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existingCheckIn } = await supabase
        .from('weekly_checkins')
        .select('created_at')
        .eq('client_id', user.id)
        .gt('created_at', new Date(Date.now() - 60000).toISOString())
        .maybeSingle();

      setCanCheckIn(!existingCheckIn);
    }

    checkCanSubmit();
    // Kolla var 10:e sekund om tidslåset har gått ut
    const interval = setInterval(checkCanSubmit, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild className="md:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white hover:bg-white/10"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] bg-[#222] border-r border-[#333] p-0">
        <SheetHeader className="p-4 border-b border-[#333]">
          <SheetTitle className="text-white">Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col p-4 space-y-2">
          <Button
            asChild
            variant="ghost"
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10"
          >
            <Link to="/dashboard" onClick={() => onOpenChange(false)}>
              <LayoutDashboard className="h-5 w-5 mr-2" />
              Dashboard
            </Link>
          </Button>
          {canCheckIn && (
            <Button
              asChild
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10"
            >
              <Link to="/weekly-checkins" onClick={() => onOpenChange(false)}>
                <ClipboardCheck className="h-5 w-5 mr-2" />
                Weekly Check-ins
              </Link>
            </Button>
          )}
          <Button
            asChild
            variant="ghost"
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10"
          >
            <Link to="/nutrition-and-training" onClick={() => onOpenChange(false)}>
              <Dumbbell className="h-5 w-5 mr-2" />
              Nutrition & Training
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10"
          >
            <Link to="/messages" onClick={() => onOpenChange(false)}>
              <MessageSquare className="h-5 w-5 mr-2" />
              Messages
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10"
          >
            <Link to="/settings" onClick={() => onOpenChange(false)}>
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10"
            onClick={() => {
              onSignOut();
              onOpenChange(false);
            }}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
