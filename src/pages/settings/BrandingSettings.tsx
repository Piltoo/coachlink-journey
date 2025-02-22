
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function BrandingSettings() {
  const [companyName, setCompanyName] = useState("FitCoach");
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBrandingSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Add company name fetching logic here if needed
    };

    fetchBrandingSettings();
  }, []);

  const handleSaveCompanyName = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User not found. Please try logging in again.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('theme_preferences')
      .upsert({
        user_id: userId,
        company_name: companyName
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error saving company name:', error);
      toast({
        title: "Error",
        description: "Failed to save company name",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Company name saved successfully",
    });
  };

  return (
    <div className="grid gap-6">
      <div className="space-y-2">
        <Label htmlFor="company-name">Company Name</Label>
        <Input
          id="company-name"
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Enter your company name"
          className="max-w-md"
        />
      </div>
      <Button onClick={handleSaveCompanyName} className="w-full sm:w-auto">
        Save Company Name
      </Button>
    </div>
  );
}
