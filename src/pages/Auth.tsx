
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ServiceSelection } from "@/components/auth/ServiceSelection";
import { PasswordResetForm } from "@/components/auth/PasswordResetForm";
import { ConfirmationMessage } from "@/components/auth/ConfirmationMessage";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password reset link has been sent to your email",
      });
      setIsForgotPassword(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset password email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (selectedServices.length === 0) {
          throw new Error("Please select at least one service");
        }
        if (!agreedToTerms) {
          throw new Error("Please agree to the terms and conditions");
        }

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: 'client',
              requested_services: selectedServices
            },
          },
        });

        if (signUpError) throw signUpError;

        if (signUpData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: signUpData.user.id,
              email: email,
              full_name: fullName,
              role: 'client',
              requested_services: selectedServices
            });

          if (profileError) throw profileError;

          const { data: coaches, error: coachesError } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'coach');

          if (coachesError) throw coachesError;

          if (coaches && coaches.length > 0) {
            const coachClientRelations = coaches.map(coach => ({
              client_id: signUpData.user.id,
              coach_id: coach.id,
              requested_services: selectedServices,
              status: 'not_connected'
            }));

            const { error: relationshipError } = await supabase
              .from('coach_clients')
              .insert(coachClientRelations);

            if (relationshipError) throw relationshipError;
          }

          setShowConfirmation(true);
        }
      } else {
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
            setShowPasswordReset(true);
          } else {
            navigate("/dashboard");
          }
        }
      }
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

  if (showPasswordReset) {
    return <PasswordResetForm />;
  }

  if (showConfirmation) {
    return <ConfirmationMessage />;
  }

  if (isForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100/30 to-green-50 flex items-center justify-center px-4">
        <GlassCard className="w-full max-w-md p-8 bg-white/40 backdrop-blur-lg">
          <h2 className="text-2xl font-bold text-primary text-center mb-6">
            Reset Password
          </h2>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button
              type="submit"
              className="w-full bg-[#a7cca4] hover:bg-[#96bb93] text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="text-[#a7cca4] hover:underline text-sm"
              >
                Back to login
              </button>
            </div>
          </form>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100/30 to-green-50 flex items-center justify-center px-4">
      <GlassCard className="w-full max-w-md p-8 bg-white/40 backdrop-blur-lg">
        <h2 className="text-2xl font-bold text-primary text-center mb-6">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <Input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}
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
          
          {!isSignUp && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="text-sm text-[#a7cca4] hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}
          
          {isSignUp && (
            <ServiceSelection
              selectedServices={selectedServices}
              setSelectedServices={setSelectedServices}
              agreedToTerms={agreedToTerms}
              setAgreedToTerms={setAgreedToTerms}
            />
          )}

          <Button
            type="submit"
            className="w-full bg-[#a7cca4] hover:bg-[#96bb93] text-white font-medium"
            disabled={isLoading || (isSignUp && !agreedToTerms)}
          >
            {isLoading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setSelectedServices([]);
              setAgreedToTerms(false);
              setFullName("");
            }}
            className="text-[#a7cca4] hover:underline"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

export default Auth;
