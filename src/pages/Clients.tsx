
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InviteClientDialog } from "@/components/dashboard/InviteClientDialog";
import { ClientProfileCard } from "@/components/dashboard/ClientProfileCard";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, UserCircle } from "lucide-react";

type Client = {
  id: string;
  full_name: string | null;
  email: string;
  status: string;
};

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchClients = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("No user found");
      return;
    }

    console.log("Current coach ID:", user.id);

    // Fetch coach-client relationships
    const { data: clientsData, error: clientsError } = await supabase
      .from('coach_clients')
      .select(`
        client_id,
        status,
        profiles (
          id,
          full_name,
          email
        )
      `)
      .eq('coach_id', user.id);

    if (clientsError) {
      console.error("Error fetching clients:", clientsError);
      toast({
        title: "Error",
        description: "Failed to load clients: " + clientsError.message,
        variant: "destructive",
      });
      return;
    }

    console.log("Raw coach_clients data:", clientsData);

    if (clientsData) {
      const formattedClients = clientsData
        .filter(c => c.profiles) // Filter out any null profiles
        .map(c => ({
          id: c.profiles.id,
          full_name: c.profiles.full_name,
          email: c.profiles.email,
          status: c.status
        }));
      console.log("Formatted clients data:", formattedClients);
      setClients(formattedClients);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleClientClick = (clientId: string) => {
    setSelectedClientId(clientId);
  };

  const handleUnsubscribe = () => {
    setSelectedClientId(null);
    fetchClients();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-primary">My Clients</h1>
            </div>
            <InviteClientDialog onClientAdded={fetchClients} />
          </div>

          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.length === 0 ? (
                <div className="col-span-full text-center text-muted-foreground py-8">
                  No clients found. Invite your first client using the button above.
                </div>
              ) : (
                clients.map((client) => (
                  <Card
                    key={client.id}
                    className="cursor-pointer hover:bg-accent/5 transition-colors"
                    onClick={() => handleClientClick(client.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <UserCircle className="w-12 h-12 text-primary" />
                        <div>
                          <h3 className="font-semibold text-lg">
                            {client.full_name || "Unnamed Client"}
                          </h3>
                          <p className="text-sm text-muted-foreground">{client.email}</p>
                          <span className={`mt-2 inline-block text-sm px-2 py-1 rounded-full ${
                            client.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {client.status}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>

          <Dialog open={!!selectedClientId} onOpenChange={() => setSelectedClientId(null)}>
            <DialogContent className="max-w-4xl h-[90vh]">
              {selectedClientId && (
                <ClientProfileCard
                  clientId={selectedClientId}
                  onUnsubscribe={handleUnsubscribe}
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
