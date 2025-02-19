
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ClientList } from "@/components/dashboard/ClientList";
import { InviteClientDialog } from "@/components/dashboard/InviteClientDialog";
import { RecentCheckIns } from "@/components/dashboard/RecentCheckIns";

type Client = {
  id: string;
  full_name: string | null;
  email: string;
  status: string;
};

type CheckIn = {
  id: string;
  created_at: string;
  weight_kg: number;
  profiles: {
    full_name: string | null;
    email: string;
  };
};

const Clients = () => {
  const [recentCheckIns, setRecentCheckIns] = useState<CheckIn[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: "Error",
            description: "You must be logged in to view clients",
            variant: "destructive",
          });
          return;
        }

        // First verify if the user is a trainer
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError || profileData?.role !== 'trainer') {
          toast({
            title: "Error",
            description: "Only trainers can view clients",
            variant: "destructive",
          });
          return;
        }

        // Fetch coach's clients
        const { data: clientsData, error: clientsError } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            email,
            coach_clients!inner (
              status
            )
          `)
          .eq('coach_clients.coach_id', user.id);

        if (clientsError) {
          console.error('Error fetching clients:', clientsError);
          toast({
            title: "Error",
            description: "Failed to load clients",
            variant: "destructive",
          });
          return;
        }

        setClients(clientsData?.map(c => ({
          id: c.id,
          full_name: c.full_name,
          email: c.email,
          status: c.coach_clients[0].status
        })) || []);

        // Fetch recent check-ins
        const { data: checkIns, error: checkInsError } = await supabase
          .from('weekly_checkins')
          .select(`
            id,
            created_at,
            weight_kg,
            profiles:client_id (
              full_name,
              email
            )
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (checkInsError) {
          console.error('Error fetching check-ins:', checkInsError);
          toast({
            title: "Error",
            description: "Failed to load recent check-ins",
            variant: "destructive",
          });
          return;
        }

        setRecentCheckIns(checkIns || []);
      } catch (error) {
        console.error('Error in fetchClientData:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    };

    fetchClientData();
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-primary">My Clients</h1>
            <InviteClientDialog />
          </div>

          <ClientList clients={clients} />
          <RecentCheckIns checkIns={recentCheckIns} />
        </div>
      </div>
    </div>
  );
};

export default Clients;
