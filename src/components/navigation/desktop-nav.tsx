
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ClipboardCheck, Dumbbell, MessageSquare, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface DesktopNavProps {
  onSignOut: () => void;
}

export function DesktopNav({ onSignOut }: DesktopNavProps) {
  const location = useLocation();
  const [canCheckIn, setCanCheckIn] = useState(true);
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    async function checkCanSubmit() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existingCheckIn } = await supabase
        .from('weekly_checkins')
        .select('created_at')
        .eq('client_id', user.id)
        .gt('created_at', new Date(Date.now() - 300000).toISOString())
        .maybeSingle();

      setCanCheckIn(!existingCheckIn);
    }

    checkCanSubmit();
    // Kolla var 10:e sekund om tidslåset har gått ut
    const interval = setInterval(checkCanSubmit, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-4">
      <Button
        asChild
        variant="ghost"
        size="icon"
        className={`w-12 h-12 rounded-full ${isActive('/dashboard') ? 'bg-green-100/20 text-green-100' : 'text-gray-400 hover:text-green-100 hover:bg-green-100/20'}`}
      >
        <Link to="/dashboard" title="Dashboard">
          <LayoutDashboard className="h-5 w-5" />
        </Link>
      </Button>
      {canCheckIn && (
        <Button
          asChild
          variant="ghost"
          size="icon"
          className={`w-12 h-12 rounded-full ${isActive('/weekly-checkins') ? 'bg-green-100/20 text-green-100' : 'text-gray-400 hover:text-green-100 hover:bg-green-100/20'}`}
        >
          <Link to="/weekly-checkins" title="Weekly Check-ins">
            <ClipboardCheck className="h-5 w-5" />
          </Link>
        </Button>
      )}
      <Button
        asChild
        variant="ghost"
        size="icon"
        className={`w-12 h-12 rounded-full ${isActive('/nutrition-and-training') ? 'bg-green-100/20 text-green-100' : 'text-gray-400 hover:text-green-100 hover:bg-green-100/20'}`}
      >
        <Link to="/nutrition-and-training" title="Nutrition & Training">
          <Dumbbell className="h-5 w-5" />
        </Link>
      </Button>
      <Button
        asChild
        variant="ghost"
        size="icon"
        className={`w-12 h-12 rounded-full ${isActive('/messages') ? 'bg-green-100/20 text-green-100' : 'text-gray-400 hover:text-green-100 hover:bg-green-100/20'}`}
      >
        <Link to="/messages" title="Messages">
          <MessageSquare className="h-5 w-5" />
        </Link>
      </Button>
      <Button
        asChild
        variant="ghost"
        size="icon"
        className={`w-12 h-12 rounded-full ${isActive('/settings') ? 'bg-green-100/20 text-green-100' : 'text-gray-400 hover:text-green-100 hover:bg-green-100/20'}`}
      >
        <Link to="/settings" title="Settings">
          <Settings className="h-5 w-5" />
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="w-12 h-12 rounded-full text-gray-400 hover:text-green-100 hover:bg-green-100/20"
        onClick={onSignOut}
        title="Sign Out"
      >
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  );
}
