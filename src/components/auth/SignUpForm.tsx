
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

interface SignUpFormProps {
  onSuccess: () => void;
  onToggleMode: () => void;
}

export const SignUpForm = ({ onSuccess, onToggleMode }: SignUpFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
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

      // First, sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      if (signUpData.user) {
        // Insert into profiles table with correct role value
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: signUpData.user.id,
            email: email,
            full_name: fullName,
            role: 'client',
            registration_status: 'pending',
            requested_services: selectedServices
          });

        if (profileError) throw profileError;

        // Get all coaches
        const { data: coaches, error: coachesError } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'coach');

        if (coachesError) throw coachesError;

        // Create coach-client relationships if there are any coaches
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

        onSuccess();
      }
    } catch (error: any) {
      console.error("Error during signup:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred during signup",
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
      <div>
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        />
        <label htmlFor="terms" className="text-sm text-gray-600">
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
        disabled={isLoading || !agreedToTerms}
      >
        {isLoading ? "Loading..." : "Sign Up"}
      </Button>
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onToggleMode}
          className="text-[#a7cca4] hover:underline"
        >
          Already have an account? Sign in
        </button>
      </div>
    </form>
  );
};
