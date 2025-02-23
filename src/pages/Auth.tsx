
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (showConfirmation) {
      const timer = setTimeout(() => {
        navigate("/");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfirmation, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error during auth:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred during authentication",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100/30 to-green-50 flex items-center justify-center px-4">
        <GlassCard className="w-full max-w-md p-8 bg-white/40 backdrop-blur-lg text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">Thank you for your request!</h2>
          <p className="text-gray-600">
            We will send you an email with the confirmation when a coach accepts your request.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Redirecting to home page in a few seconds...
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100/30 to-green-50 flex items-center justify-center px-4">
      <GlassCard className="w-full max-w-md p-8 bg-white/40 backdrop-blur-lg">
        <h2 className="text-2xl font-bold text-primary text-center mb-6">
          Welcome Back
        </h2>
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
        </form>
        <div className="mt-4 text-center">
          <Link
            to="/lead"
            className="text-[#a7cca4] hover:underline"
          >
            Interested in our services? Click here to learn more
          </Link>
        </div>
      </GlassCard>
    </div>
  );
};

export default Auth;
