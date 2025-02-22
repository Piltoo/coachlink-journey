
import { Client } from "./useClients";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
import { MoreVertical, UserX, UserCheck, Trash2 } from "lucide-react";
import { ServiceBadge } from "../new-arrivals/ServiceBadge";

interface ClientTableProps {
  clients: Client[];
  onClientSelected: (clientId: string) => void;
  onClientUpdated: () => void;
}

export function ClientTable({ clients, onClientSelected, onClientUpdated }: ClientTableProps) {
  const { toast } = useToast();

  const handleStatusChange = async (clientId: string, newStatus: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to perform this action",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('coach_clients')
        .update({ status: newStatus })
        .eq('client_id', clientId)
        .eq('coach_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Client status updated to ${newStatus}`,
      });

      onClientUpdated();
    } catch (error: any) {
      console.error("Error updating client status:", error);
      toast({
        title: "Error",
        description: "Failed to update client status: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm("Are you sure you want to delete this client? This will remove all their data and cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('coach_clients')
        .delete()
        .eq('client_id', clientId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Client deleted successfully",
      });

      onClientUpdated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Services</TableHead>
          <TableHead>Requested Services</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
              No clients found.
            </TableCell>
          </TableRow>
        ) : (
          clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">
                {client.full_name || "Unnamed Client"}
              </TableCell>
              <TableCell>{client.email}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                  {client.status}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {client.hasNutritionPlan && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Nutrition
                    </span>
                  )}
                  {client.hasWorkoutPlan && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Training
                    </span>
                  )}
                  {client.hasPersonalTraining && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      PT
                    </span>
                  )}
                </div>
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
                    <DropdownMenuItem onClick={() => onClientSelected(client.id)}>
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {client.status === 'active' ? (
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange(client.id, 'inactive')}
                        className="text-yellow-600"
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        Make Inactive
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange(client.id, 'active')}
                        className="text-green-600"
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Make Active
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => handleDeleteClient(client.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Client
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
