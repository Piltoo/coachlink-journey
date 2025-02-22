
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AccountSettings() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFirstName(profile.first_name || "");
        setLastName(profile.last_name || "");
        setEmail(profile.email || "");
      }
    };

    fetchUserProfile();
  }, []);

  const handleSaveProfile = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User not found. Please try logging in again.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
      })
      .eq('id', userId);

    if (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Profile updated successfully",
    });
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={email}
          disabled
          className="max-w-md"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="first-name">First Name</Label>
        <Input
          id="first-name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="max-w-md"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="last-name">Last Name</Label>
        <Input
          id="last-name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="max-w-md"
        />
      </div>
      <Button onClick={handleSaveProfile} className="w-full sm:w-auto">
        Save Profile
      </Button>
    </div>
  );
}
