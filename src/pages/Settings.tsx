
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings2, Palette } from "lucide-react";

// Define types to match our database schema
type ThemePreferences = {
  id: string;
  user_id: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  created_at: string;
  updated_at: string;
};

export default function Settings() {
  const [primaryColor, setPrimaryColor] = useState("#1B4332");
  const [secondaryColor, setSecondaryColor] = useState("#95D5B2");
  const [accentColor, setAccentColor] = useState("#2D6A4F");
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndPreferences = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Fetch user role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserRole(profile.role);
      }

      // Fetch theme preferences
      const { data: preferences } = await supabase
        .from('theme_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (preferences) {
        const themePrefs = preferences as ThemePreferences;
        setPrimaryColor(themePrefs.primary_color);
        setSecondaryColor(themePrefs.secondary_color);
        setAccentColor(themePrefs.accent_color);
      }
    };

    fetchUserAndPreferences();
  }, []);

  const handleSaveTheme = async () => {
    if (!userId) return;

    const themeData = {
      user_id: userId,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      accent_color: accentColor,
    };

    const { error } = await supabase
      .from('theme_preferences')
      .upsert(themeData, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error saving theme preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save theme preferences",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Theme preferences saved successfully",
    });

    // Apply theme changes
    document.documentElement.style.setProperty('--primary', primaryColor);
    document.documentElement.style.setProperty('--secondary', secondaryColor);
    document.documentElement.style.setProperty('--accent', accentColor);
  };

  if (userRole !== 'trainer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50 flex items-center justify-center">
        <Card className="p-6 bg-white/40 backdrop-blur-lg border border-green-100">
          <h2 className="text-xl font-semibold text-primary mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">Only trainers can access the settings page.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Settings2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">Settings</h1>
          </div>

          <Card className="p-6 bg-white/40 backdrop-blur-lg border border-green-100">
            <Tabs defaultValue="theme">
              <TabsList className="mb-4">
                <TabsTrigger value="theme" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Theme
                </TabsTrigger>
              </TabsList>

              <TabsContent value="theme" className="space-y-6">
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex gap-4 items-center">
                      <Input
                        id="primary-color"
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-20 h-10"
                      />
                      <div 
                        className="w-20 h-10 rounded"
                        style={{ backgroundColor: primaryColor }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondary-color">Secondary Color</Label>
                    <div className="flex gap-4 items-center">
                      <Input
                        id="secondary-color"
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-20 h-10"
                      />
                      <div 
                        className="w-20 h-10 rounded"
                        style={{ backgroundColor: secondaryColor }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accent-color">Accent Color</Label>
                    <div className="flex gap-4 items-center">
                      <Input
                        id="accent-color"
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-20 h-10"
                      />
                      <div 
                        className="w-20 h-10 rounded"
                        style={{ backgroundColor: accentColor }}
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveTheme} className="w-full sm:w-auto">
                    Save Theme
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
