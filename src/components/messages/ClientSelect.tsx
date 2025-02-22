
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

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
      <h2 className="font-semibold">Your Clients</h2>
      <Command className="rounded-lg border shadow-md">
        <CommandInput placeholder="Search clients..." disabled={disabled} />
        <CommandList>
          <CommandEmpty>No clients found.</CommandEmpty>
          <CommandGroup>
            {(clients || []).map((client) => (
              <CommandItem
                key={client.id}
                onSelect={() => onSelect(client)}
                className={`cursor-pointer ${
                  selectedClient?.id === client.id ? 'bg-accent' : ''
                }`}
              >
                <span className="font-medium">
                  {client.full_name || client.email}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
