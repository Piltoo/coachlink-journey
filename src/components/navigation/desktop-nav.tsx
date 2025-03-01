import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  Users, 
  Dumbbell, 
  MessageSquare, 
  Settings, 
  LogOut,
  Utensils,
  Dumbbell as DumbbellIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCoachCheck } from "@/hooks/useCoachCheck";

interface DesktopNavProps {
  onSignOut: () => void;
}

export function DesktopNav({ onSignOut }: DesktopNavProps) {
  const location = useLocation();
  const [canCheckIn, setCanCheckIn] = useState(true);
  const { isCoach } = useCoachCheck();
  const isActive = (path: string) => location.pathname === path;

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

    if (!isCoach) {
      checkCanSubmit();
      const interval = setInterval(checkCanSubmit, 10000);
      return () => clearInterval(interval);
    }
  }, [isCoach]);

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
      
      {isCoach ? (
        <Button
          asChild
          variant="ghost"
          size="icon"
          className={`w-12 h-12 rounded-full ${isActive('/clients') ? 'bg-green-100/20 text-green-100' : 'text-gray-400 hover:text-green-100 hover:bg-green-100/20'}`}
        >
          <Link to="/clients" title="My Clients">
            <Users className="h-5 w-5" />
          </Link>
        </Button>
      ) : (
        <>
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
            className={`w-12 h-12 rounded-full ${isActive('/client/training-plans') ? 'bg-green-100/20 text-green-100' : 'text-gray-400 hover:text-green-100 hover:bg-green-100/20'}`}
          >
            <Link to="/client/training-plans" title="My Training Plans">
              <DumbbellIcon className="h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className={`w-12 h-12 rounded-full ${isActive('/client/nutrition-plans') ? 'bg-green-100/20 text-green-100' : 'text-gray-400 hover:text-green-100 hover:bg-green-100/20'}`}
          >
            <Link to="/client/nutrition-plans" title="My Nutrition Plans">
              <Utensils className="h-5 w-5" />
            </Link>
          </Button>
        </>
      )}
      
      {isCoach && (
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
      )}
      
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
