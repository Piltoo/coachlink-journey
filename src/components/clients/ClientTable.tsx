
import { Client } from "./types";
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
import { useNavigate } from "react-router-dom";
import { useDeleteClient } from "./useDeleteClient";
import { ClientTableRow } from "./ClientTableRow";

interface ClientTableProps {
  clients: Client[];
  onClientSelected: (clientId: string) => void;
  onClientUpdated: () => void;
}

export function ClientTable({ clients, onClientSelected, onClientUpdated }: ClientTableProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { deleteClient } = useDeleteClient(onClientUpdated);

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
            <ClientTableRow
              key={client.id}
              client={client}
              onViewProfile={() => navigate(`/clients/${client.id}`)}
              onStatusChange={handleStatusChange}
              onDelete={deleteClient}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
}
