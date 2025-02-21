import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { X } from "lucide-react";
import { Home } from "lucide-react";
import { LayoutDashboard } from "lucide-react";
import { Users } from "lucide-react";
import { Dumbbell } from "lucide-react";
import { MessageSquare } from "lucide-react";
import { Settings } from "lucide-react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
    <>
      <div className="fixed w-full h-16 bg-secondary border-b border-secondary-foreground z-50">
        <div className="container max-w-7xl mx-auto flex items-center justify-between h-full px-4">
          <Link to="/" className="text-2xl font-bold text-primary">
            Fitness App
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            <Button
              asChild
              variant="ghost"
              className="text-primary hover:text-accent hover:bg-secondary"
            >
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="text-primary hover:text-accent hover:bg-secondary"
            >
              <Link to="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="text-primary hover:text-accent hover:bg-secondary"
            >
              <Link to="/clients">
                <Users className="mr-2 h-4 w-4" />
                Clients
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="text-primary hover:text-accent hover:bg-secondary"
              title="Nutrition & Training"
            >
              <Link to="/nutrition-training">
                <Dumbbell className="mr-2 h-4 w-4" />
                Nutrition & Training
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="text-primary hover:text-accent hover:bg-secondary"
            >
              <Link to="/messages">
                <MessageSquare className="mr-2 h-4 w-4" />
                Messages
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="text-primary hover:text-accent hover:bg-secondary"
            >
              <Link to="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="text-primary hover:text-accent hover:bg-secondary"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="md:hidden text-primary hover:text-accent hover:bg-secondary p-2 h-10 w-10"
                size="icon"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader className="text-left">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <Button
                  asChild
                  variant="ghost"
                  className="justify-start text-primary hover:text-accent hover:bg-secondary w-full"
                >
                  <Link to="/">
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="justify-start text-primary hover:text-accent hover:bg-secondary w-full"
                >
                  <Link to="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="justify-start text-primary hover:text-accent hover:bg-secondary w-full"
                >
                  <Link to="/clients">
                    <Users className="mr-2 h-4 w-4" />
                    Clients
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="justify-start text-primary hover:text-accent hover:bg-secondary w-full"
                >
                  <Link to="/nutrition-training">
                    <Dumbbell className="mr-2 h-4 w-4" />
                    Nutrition & Training
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="justify-start text-primary hover:text-accent hover:bg-secondary w-full"
                >
                  <Link to="/messages">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="justify-start text-primary hover:text-accent hover:bg-secondary w-full"
                >
                  <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </Button>
              </div>
              <Separator />
              <Button
                variant="ghost"
                className="justify-start text-primary hover:text-accent hover:bg-secondary w-full"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
              <Button
                variant="ghost"
                className="md:hidden text-primary hover:text-accent hover:bg-secondary p-2 h-10 w-10 absolute top-2 right-2"
                size="icon"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
}
