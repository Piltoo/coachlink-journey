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
import { ServiceBadge } from "../new-arrivals/ServiceBadge";
import { ClientActions } from "./ClientActions";
import { CurrentServices } from "./CurrentServices";
import { StatusBadge } from "./StatusBadge";
import { useNavigate } from "react-router-dom";
import { Input } from "../ui/input";

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

  const createModal = (title: string, content: HTMLElement, onConfirm: () => void) => {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = 'white';
    modal.style.padding = '20px';
    modal.style.borderRadius = '8px';
    modal.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    modal.style.zIndex = '1000';
    modal.style.width = '400px';
    modal.style.maxWidth = '90vw';
    
    const titleElement = document.createElement('h3');
    titleElement.textContent = title;
    titleElement.style.marginBottom = '16px';
    titleElement.style.fontWeight = 'bold';
    titleElement.style.fontSize = '18px';
    
    const buttons = document.createElement('div');
    buttons.style.display = 'flex';
    buttons.style.gap = '8px';
    buttons.style.marginTop = '16px';
    buttons.style.justifyContent = 'flex-end';
    
    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Confirm';
    confirmButton.className = 'bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700';
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.className = 'bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300';
    
    buttons.appendChild(cancelButton);
    buttons.appendChild(confirmButton);
    
    modal.appendChild(titleElement);
    modal.appendChild(content);
    modal.appendChild(buttons);
    
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '999';
    
    document.body.appendChild(overlay);
    document.body.appendChild(modal);
    
    return new Promise((resolve) => {
      const cleanup = () => {
        document.body.removeChild(modal);
        document.body.removeChild(overlay);
      };
      
      confirmButton.onclick = () => {
        onConfirm();
        cleanup();
        resolve(true);
      };
      
      cancelButton.onclick = () => {
        cleanup();
        resolve(false);
      };
      
      overlay.onclick = () => {
        cleanup();
        resolve(false);
      };
    });
  };

  const handleDeleteClient = async (clientId: string) => {
    const passwordInput = document.createElement('div');
    passwordInput.innerHTML = `
      <input type="password" id="password-confirmation" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="Enter your password">
    `;
    
    const getPassword = () => (document.getElementById('password-confirmation') as HTMLInputElement).value;
    
    const passwordConfirmed = await createModal(
      'Confirm Deletion',
      passwordInput,
      () => {}
    );
    
    if (!passwordConfirmed) {
      return;
    }

    const passwordValue = getPassword();

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

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: passwordValue,
      });

      if (signInError) {
        toast({
          title: "Error",
          description: "Incorrect password",
          variant: "destructive",
        });
        return;
      }

      const confirmContent = document.createElement('p');
      confirmContent.textContent = "Are you sure you want to delete this client? This action cannot be undone.";
      confirmContent.style.color = '#4B5563'; // text-gray-600
      confirmContent.style.marginBottom = '8px';
      
      const confirmed = await createModal(
        'Delete Client',
        confirmContent,
        () => {}
      );

      if (!confirmed) {
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
