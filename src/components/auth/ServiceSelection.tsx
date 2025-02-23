
import { Checkbox } from "@/components/ui/checkbox";

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

interface ServiceSelectionProps {
  selectedServices: string[];
  onServiceChange: (services: string[]) => void;
}

export const ServiceSelection = ({
  selectedServices,
  onServiceChange,
}: ServiceSelectionProps) => {
  return (
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
                onServiceChange(
                  checked
                    ? [...selectedServices, service.id]
                    : selectedServices.filter((id) => id !== service.id)
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
  );
};
