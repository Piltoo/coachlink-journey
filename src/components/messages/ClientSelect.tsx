
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Profile = {
  id: string;
  full_name: string | null;
  email: string;
};

interface ClientSelectProps {
  clients: Profile[];
  selectedClient: Profile | null;
  onSelect: (client: Profile) => void;
  disabled?: boolean;
}

export function ClientSelect({ clients = [], selectedClient, onSelect, disabled }: ClientSelectProps) {
  return (
    <div className="space-y-4">
      <Select
        disabled={disabled}
        value={selectedClient?.id}
        onValueChange={(value) => {
          const client = clients.find(c => c.id === value);
          if (client) onSelect(client);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a client" />
        </SelectTrigger>
        <SelectContent>
          {clients.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {client.full_name || client.email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
