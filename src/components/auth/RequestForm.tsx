
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export function RequestForm() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
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

      // Create a temporary random password
      const tempPassword = Math.random().toString(36).slice(-12);

      // Sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: tempPassword,
        options: {
          data: {
            full_name: fullName,
            requested_services: selectedServices,
            registration_status: 'pending'
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error("Failed to create user");

      navigate("/auth/confirmation");
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="text"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      
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
  );
}
