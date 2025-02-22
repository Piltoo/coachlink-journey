
import { useState } from "react";
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
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (selectedServices.length === 0) {
        throw new Error("Please select at least one service");
      }
      if (!agreedToTerms) {
        throw new Error("Please agree to the terms and conditions");
      }

      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8);

      // Sign up the user with the temporary password
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: tempPassword,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error("Failed to create user");

      // Create the coach-client relationship with pending status
      const { error: relationError } = await supabase
        .from('coach_clients')
        .insert({
          client_id: signUpData.user.id,
          coach_id: process.env.VITE_DEFAULT_COACH_ID, // You'll need to set this in your .env
          status: 'pending',
          requested_services: selectedServices
        });

      if (relationError) throw relationError;

      setShowConfirmation(true);
      setTimeout(() => {
        navigate("/");
      }, 5000);

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
            We will review your application and get back to you soon via email.
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
          Request to Join
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
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

          <Button
            type="submit"
            className="w-full bg-[#a7cca4] hover:bg-[#96bb93] text-white font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </GlassCard>
    </div>
  );
};

export default Auth;
