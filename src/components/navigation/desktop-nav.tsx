
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Dumbbell, MessageSquare, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DesktopNavProps {
  onSignOut: () => void;
}

export function DesktopNav({ onSignOut }: DesktopNavProps) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="hidden md:flex items-center space-x-2 flex-1 justify-center">
      <Button
        asChild
        variant="ghost"
        size="icon"
        className={`w-12 h-12 rounded-full ${isActive('/dashboard') ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
      >
        <Link to="/dashboard" title="Dashboard">
          <LayoutDashboard className="h-5 w-5" />
        </Link>
      </Button>
      <Button
        asChild
        variant="ghost"
        size="icon"
        className={`w-12 h-12 rounded-full ${isActive('/clients') ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
      >
        <Link to="/clients" title="Clients">
          <Users className="h-5 w-5" />
        </Link>
      </Button>
      <Button
        asChild
        variant="ghost"
        size="icon"
        className={`w-12 h-12 rounded-full ${isActive('/nutrition-training') ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
      >
        <Link to="/nutrition-training" title="Nutrition & Training">
          <Dumbbell className="h-5 w-5" />
        </Link>
      </Button>
      <Button
        asChild
        variant="ghost"
        size="icon"
        className={`w-12 h-12 rounded-full ${isActive('/messages') ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
      >
        <Link to="/messages" title="Messages">
          <MessageSquare className="h-5 w-5" />
        </Link>
      </Button>
      <Button
        asChild
        variant="ghost"
        size="icon"
        className={`w-12 h-12 rounded-full ${isActive('/settings') ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
      >
        <Link to="/settings" title="Settings">
          <Settings className="h-5 w-5" />
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="w-12 h-12 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
        onClick={onSignOut}
        title="Sign Out"
      >
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  );
}
