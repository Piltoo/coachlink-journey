
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

export type ServiceOption = {
  id: string;
  label: string;
};

interface ServiceSelectionProps {
  selectedServices: string[];
  setSelectedServices: (services: string[]) => void;
  agreedToTerms: boolean;
  setAgreedToTerms: (agreed: boolean) => void;
}

export const serviceOptions: ServiceOption[] = [
  { id: "personal-training", label: "Personal Training" },
  { id: "coaching", label: "Coaching" },
  { id: "treatments", label: "Treatments" },
  { id: "others", label: "Others" },
];

export function ServiceSelection({ 
  selectedServices, 
  setSelectedServices, 
  agreedToTerms, 
  setAgreedToTerms 
}: ServiceSelectionProps) {
  const { toast } = useToast();

  return (
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
                  setSelectedServices(
                    checked
                      ? [...selectedServices, service.id]
                      : selectedServices.filter(id => id !== service.id)
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
  );
}
