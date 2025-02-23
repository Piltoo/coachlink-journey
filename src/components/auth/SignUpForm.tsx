
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ServiceSelection } from "./ServiceSelection";
import { TermsAgreement } from "./TermsAgreement";
import { signUpUser } from "@/services/auth/signup";

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

      await signUpUser({
        email,
        password,
        fullName,
        selectedServices,
      });

      onSuccess();
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
      <ServiceSelection
        selectedServices={selectedServices}
        onServiceChange={setSelectedServices}
      />
      <TermsAgreement
        agreed={agreedToTerms}
        onAgreementChange={setAgreedToTerms}
      />
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
