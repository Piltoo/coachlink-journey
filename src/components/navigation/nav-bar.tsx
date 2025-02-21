
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Dumbbell, MessageSquare, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function NavBar() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const location = useLocation();

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

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed w-full h-16 bg-[#222] border-b border-[#333] z-50">
      <div className="container max-w-7xl mx-auto flex items-center justify-between h-full px-4">
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
            onClick={handleSignOut}
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
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
                <Link to="/dashboard" onClick={() => setOpen(false)}>
                  <LayoutDashboard className="h-5 w-5 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10"
              >
                <Link to="/clients" onClick={() => setOpen(false)}>
                  <Users className="h-5 w-5 mr-2" />
                  Clients
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10"
              >
                <Link to="/nutrition-training" onClick={() => setOpen(false)}>
                  <Dumbbell className="h-5 w-5 mr-2" />
                  Nutrition & Training
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10"
              >
                <Link to="/messages" onClick={() => setOpen(false)}>
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Messages
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10"
              >
                <Link to="/settings" onClick={() => setOpen(false)}>
                  <Settings className="h-5 w-5 mr-2" />
                  Settings
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10"
                onClick={() => {
                  handleSignOut();
                  setOpen(false);
                }}
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign Out
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
