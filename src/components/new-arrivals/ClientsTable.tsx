
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, UserCheck, Trash2 } from "lucide-react";
import { ServiceBadge } from "./ServiceBadge";
import { Client } from "./types";

interface ClientsTableProps {
  clients: Client[];
  onViewProfile: (clientId: string) => void;
  onAddClient: (clientId: string) => void;
  onDeleteClient: (clientId: string) => void;
}

export const ClientsTable = ({
  clients,
  onViewProfile,
  onAddClient,
  onDeleteClient,
}: ClientsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Requested Services</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.id}>
            <TableCell className="font-medium">
              {client.full_name || "Unnamed Client"}
            </TableCell>
            <TableCell>{client.email}</TableCell>
            <TableCell>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                new arrival
              </span>
            </TableCell>
            <TableCell>
              <div className="flex gap-2 flex-wrap">
                {client.requested_services?.map((service) => (
                  <ServiceBadge key={service} service={service} />
                ))}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewProfile(client.id)}>
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onAddClient(client.id)}
                    className="text-green-600"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Add as Client
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDeleteClient(client.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
        {clients.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
              No new arrivals found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
