
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ClientProgress } from "@/components/dashboard/ClientProgress";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserCheck, UserX } from "lucide-react";

type UserRole = 'client' | 'coach' | 'admin';

type PendingClient = {
  id: string;
  full_name: string | null;
  email: string;
  requested_services: string[];
};

const Dashboard = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [firstName, setFirstName] = useState<string>("");
  const [pendingClients, setPendingClients] = useState<PendingClient[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log("No user found");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, first_name')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          return;
        }

        if (!profile) {
          console.log("No profile found");
          return;
        }
        
        setUserRole(profile.role);
        setFirstName(profile.first_name || "");

        if (profile.role === 'coach') {
          const { data: clients, error: clientsError } = await supabase
            .from('coach_clients')
            .select(`
              client_id,
              profiles!coach_clients_client_id_fkey (
                id,
                full_name,
                email
              )
            `)
            .eq('coach_id', user.id)
            .eq('status', 'pending');

          if (clientsError) {
            console.error("Error fetching clients:", clientsError);
            return;
          }

          if (clients) {
            const formattedClients = clients.map(c => ({
              id: c.profiles.id,
              full_name: c.profiles.full_name,
              email: c.profiles.email,
              requested_services: []
            }));
            setPendingClients(formattedClients);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [toast]);

  const handleClientResponse = async (clientId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('coach_clients')
        .update({ status: approved ? 'active' : 'inactive' })
        .eq('client_id', clientId);

      if (error) throw error;

      setPendingClients(prev => prev.filter(client => client.id !== clientId));
      
      toast({
        title: "Success",
        description: `Client ${approved ? 'approved' : 'rejected'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update client status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-[#1B4332]">
              Welcome Back{firstName ? `, ${firstName}` : ''}
            </h1>
            <div className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          <StatsCards />
          
          {userRole === 'coach' && pendingClients.length > 0 && (
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold text-primary mb-4">Waiting List ({pendingClients.length})</h2>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {pendingClients.map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{client.full_name || 'Unnamed Client'}</h3>
                        <p className="text-sm text-gray-500">{client.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleClientResponse(client.id, true)}
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleClientResponse(client.id, false)}
                        >
                          <UserX className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </GlassCard>
          )}
          
          {userRole === 'client' && (
            <ClientProgress />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
