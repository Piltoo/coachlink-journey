
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface TermsAgreementProps {
  agreed: boolean;
  onAgreementChange: (agreed: boolean) => void;
}

export const TermsAgreement = ({
  agreed,
  onAgreementChange,
}: TermsAgreementProps) => {
  const { toast } = useToast();

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="terms"
        checked={agreed}
        onCheckedChange={(checked) => onAgreementChange(checked as boolean)}
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
  );
};
