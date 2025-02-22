
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type ServiceOption = {
  id: string;
  label: string;
};

const serviceOptions: ServiceOption[] = [
  { id: "personal-training", label: "Personal Training" },
  { id: "coaching", label: "Coaching" },
  { id: "treatments", label: "Treatments" },
  { id: "others", label: "Others" },
];

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
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
      if (isSignUp) {
        if (selectedServices.length === 0) {
          throw new Error("Please select at least one service");
        }
        if (!agreedToTerms) {
          throw new Error("Please agree to the terms and conditions");
        }

        // Sign up the user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (signUpError) throw signUpError;
        
        if (signUpData.user) {
          // Update the user's profile registration_status and requested services
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ 
              registration_status: 'pending',
              requested_services: selectedServices 
            })
            .eq('id', signUpData.user.id);

          if (profileError) throw profileError;

          // Get all coaches to create not_connected relationships
          const { data: coaches, error: coachesError } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'coach');

          if (coachesError) throw coachesError;

          if (coaches && coaches.length > 0) {
            // Create coach-client relationships with initial "not_connected" status
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
        }

        setShowConfirmation(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
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
          
          {isSignUp && (
            <>
              <div className="space-y-4">
                <div className="text-sm font-medium text-gray-700">
                  Select the services you're interested in:
                </div>
                <div className="space-y-3">
                  {serviceOptions.map((service) => (
                    <div key={service.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={service.id}
                        checked={selectedServices.includes(service.id)}
                        onCheckedChange={(checked) => {
                          setSelectedServices(prev =>
                            checked
                              ? [...prev, service.id]
                              : prev.filter(id => id !== service.id)
                          );
                        }}
                      />
                      <label
                        htmlFor={service.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {service.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  required
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-gray-600"
                >
                  I agree to the{" "}
                  <button
                    type="button"
                    className="text-primary underline hover:text-primary/80"
                    onClick={() => {
                      toast({
                        title: "Coming Soon",
                        description: "The terms and conditions are currently being drafted.",
                      });
                    }}
                  >
                    terms and conditions
                  </button>
                </label>
              </div>
            </>
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
