
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SignInFormProps {
  onPasswordReset: () => void;
  onToggleMode: () => void;
  onSignInSuccess: (profileData: any) => void;
}

export const SignInForm = ({ onPasswordReset, onToggleMode, onSignInSuccess }: SignInFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;

      if (data.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role, registration_status')
          .eq('id', data.user.id)
          .single();

        if (profileData?.role === 'client' && profileData?.registration_status === 'pending') {
          onPasswordReset();
        } else {
          onSignInSuccess(profileData);
        }
      }
    } catch (error: any) {
      console.error("Error during signin:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred during sign in",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-[#a7cca4] hover:bg-[#96bb93] text-white font-medium"
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : "Sign In"}
      </Button>
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onToggleMode}
          className="text-[#a7cca4] hover:underline"
        >
          Don't have an account? Sign up
        </button>
      </div>
    </form>
  );
};
