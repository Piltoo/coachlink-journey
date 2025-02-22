
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InviteClientDialog } from "@/components/dashboard/InviteClientDialog";
import { ClientProfileCard } from "@/components/dashboard/ClientProfileCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, MoreVertical, UserX, UserCheck, Trash2 } from "lucide-react";

type Client = {
  id: string;
  full_name: string | null;
  email: string;
  status: string;
  subscription_status?: string | null;
};

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("No user found - user is not authenticated");
        return;
      }

      console.log("Current coach ID:", user.id);

      const { data: clientsData, error: clientsError } = await supabase
        .from('coach_clients')
        .select(`
          client_id,
          status,
          profiles!coach_clients_client_id_fkey (
            id,
            full_name,
            email
          ),
          subscriptions (
            status
          )
        `)
        .eq('coach_id', user.id)
        .order('status', { ascending: false });

      if (clientsError) {
        console.error("Error fetching clients:", clientsError);
        toast({
          title: "Error",
          description: "Failed to load clients: " + clientsError.message,
          variant: "destructive",
        });
        return;
      }

      console.log("Full clients data:", clientsData);

      if (clientsData) {
        const formattedClients = clientsData
          .filter(c => c.profiles) // Filter out any null profiles
          .map(c => ({
            id: c.profiles.id,
            full_name: c.profiles.full_name,
            email: c.profiles.email,
            status: c.status,
            subscription_status: c.subscriptions?.[0]?.status
          }));
        console.log("Formatted clients data:", formattedClients);
        setClients(formattedClients);
      }
    } catch (error: any) {
      console.error("Error in fetchClients:", error);
      toast({
        title: "Error",
        description: "Failed to load clients: " + error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleStatusChange = async (clientId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('coach_clients')
        .update({ status: newStatus })
        .eq('client_id', clientId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Client status updated to ${newStatus}`,
      });

      fetchClients();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update client status",
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

      fetchClients();
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
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-primary">My Clients</h1>
            </div>
            <InviteClientDialog onClientAdded={fetchClients} />
          </div>

          <ScrollArea className="h-[calc(100vh-12rem)] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscription</TableHead>
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
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                        {client.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        client.subscription_status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {client.subscription_status || 'No subscription'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedClientId(client.id)}>
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
                ))}
                {clients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No clients found. Invite your first client using the button above.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>

          <Dialog open={!!selectedClientId} onOpenChange={() => setSelectedClientId(null)}>
            <DialogContent className="max-w-4xl h-[90vh]">
              {selectedClientId && (
                <ClientProfileCard
                  clientId={selectedClientId}
                  onUnsubscribe={() => {
                    setSelectedClientId(null);
                    fetchClients();
                  }}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default Clients;
