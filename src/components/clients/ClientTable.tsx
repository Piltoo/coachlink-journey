
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
import { ServiceBadge } from "../new-arrivals/ServiceBadge";
import { ClientActions } from "./ClientActions";
import { CurrentServices } from "./CurrentServices";
import { StatusBadge } from "./StatusBadge";
import { useNavigate } from "react-router-dom";

interface ClientTableProps {
  clients: Client[];
  onClientSelected: (clientId: string) => void;
  onClientUpdated: () => void;
}

export function ClientTable({ clients, onClientSelected, onClientUpdated }: ClientTableProps) {
  const { toast } = useToast();
  const navigate = useNavigate();

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
    // Prompt for password confirmation using window.prompt
    const passwordConfirmation = window.prompt('Please enter your password to confirm deletion:');
    
    if (!passwordConfirmation) {
      return;
    }

    try {
      // Verify the password first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to perform this action",
          variant: "destructive",
        });
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: passwordConfirmation,
      });

      if (signInError) {
        toast({
          title: "Error",
          description: "Incorrect password",
          variant: "destructive",
        });
        return;
      }

      // If password is correct, show confirmation dialog
      if (!confirm("Are you sure you want to delete this client? This action cannot be undone.")) {
        return;
      }

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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Services</TableHead>
          <TableHead>Requested Services</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
              No clients found.
            </TableCell>
          </TableRow>
        ) : (
          clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">
                {client.full_name || "Unnamed Client"}
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
              <TableCell className="text-right">
                <ClientActions
                  clientId={client.id}
                  status={client.status}
                  onViewProfile={() => navigate(`/clients/${client.id}`)}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDeleteClient}
                />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
