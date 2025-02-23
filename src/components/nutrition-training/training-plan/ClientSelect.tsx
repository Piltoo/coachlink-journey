
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ClientSelectProps {
  clients: Array<{ id: string; full_name: string }>;
  selectedClientId: string;
  onClientSelect: (clientId: string) => void;
}

export function ClientSelect({ clients, selectedClientId, onClientSelect }: ClientSelectProps) {
  return (
    <div>
      <h4 className="font-medium mb-2">Send to Client</h4>
      <Select value={selectedClientId} onValueChange={onClientSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a client" />
        </SelectTrigger>
        <SelectContent>
          {clients.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {client.full_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
