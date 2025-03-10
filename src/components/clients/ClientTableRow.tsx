import { Client } from "./types";
import { TableCell, TableRow } from "@/components/ui/table";
import { ServiceBadge } from "../new-arrivals/ServiceBadge";
import { CurrentServices } from "./CurrentServices";
import { StatusBadge } from "./StatusBadge";

interface ClientTableRowProps {
  client: Client;
  onViewProfile: (clientId: string) => void;
  onStatusChange: (clientId: string, newStatus: string) => void;
  onDelete: (clientId: string) => void;
}

export function ClientTableRow({
  client,
  onViewProfile,
  onStatusChange,
  onDelete
}: ClientTableRowProps) {
  return (
    <TableRow 
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => onViewProfile(client.id)}
    >
      <TableCell className="font-medium">
        {client.full_name || "Unnamed Client"}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {client.email}
      </TableCell>
      <TableCell>
        <StatusBadge status={client.status} />
      </TableCell>
      <TableCell>
        <CurrentServices
          hasNutritionPlan={client.hasNutritionPlan}
          hasWorkoutPlan={client.hasWorkoutPlan}
          hasPersonalTraining={client.hasPersonalTraining}
        />
      </TableCell>
      <TableCell>
        <div className="flex gap-2 flex-wrap">
          {client.requested_services?.map((service) => (
            <ServiceBadge key={service} service={service} />
          ))}
        </div>
      </TableCell>
    </TableRow>
  );
}
