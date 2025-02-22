
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { UserCheck, ArrowLeft, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Profile = {
  id: string;
  full_name: string | null;
  email: string;
  registration_status: string | null;
}

type CoachClient = {
  client_id: string;
  requested_services: string[];
  profiles: Profile;
}

type PendingClient = {
  id: string;
  full_name: string | null;
  email: string;
  requested_services: string[];
  registration_status: string | null;
  hasNutritionPlan: boolean;
  hasWorkoutPlan: boolean;
  hasPersonalTraining: boolean;
};

export default function WaitingList() {
  const [pendingClients, setPendingClients] = useState<PendingClient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingClients();
  }, []);

  const fetchPendingClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log("Fetching clients for coach:", user.id);

      const { data: clients, error } = await supabase
        .from('coach_clients')
        .select(`
          client_id,
          requested_services,
          profiles!coach_clients_client_id_fkey (
            id,
            full_name,
            email,
            registration_status
          )
        `)
        .eq('coach_id', user.id)
        .eq('status', 'not_connected');

      if (error) {
        console.error("Error fetching clients:", error);
        toast({
          title: "Error",
          description: "Failed to fetch available clients",
          variant: "destructive",
        });
        return;
      }

      console.log("Received data:", clients);

      if (clients) {
        const clientPromises = (clients as CoachClient[]).map(async (record) => {
          if (!record.profiles) {
            console.log("No profile found for record:", record);
            return null;
          }

          const [nutritionPlans, workoutPlans, workoutSessions] = await Promise.all([
            supabase
              .from('nutrition_plans')
              .select('id')
              .eq('client_id', record.client_id)
              .maybeSingle(),
            supabase
              .from('workout_plans')
              .select('id')
              .eq('client_id', record.client_id)
              .maybeSingle(),
            supabase
              .from('workout_sessions')
              .select('id')
              .eq('client_id', record.client_id)
              .maybeSingle(),
          ]);

          return {
            id: record.profiles.id,
            full_name: record.profiles.full_name,
            email: record.profiles.email,
            requested_services: record.requested_services || [],
            registration_status: record.profiles.registration_status,
            hasNutritionPlan: !!nutritionPlans.data,
            hasWorkoutPlan: !!workoutPlans.data,
            hasPersonalTraining: !!workoutSessions.data,
          };
        });

        const formattedClients = (await Promise.all(clientPromises)).filter(client => client !== null) as PendingClient[];
        console.log("Formatted clients:", formattedClients);
        setPendingClients(formattedClients);
      }
    } catch (error) {
      console.error("Error in fetchPendingClients:", error);
      toast({
        title: "Error",
        description: "Failed to fetch available clients",
        variant: "destructive",
      });
    }
  };

  const handleClientResponse = async (clientId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log("Activating client:", clientId);

      const { error: relationshipError } = await supabase
        .from('coach_clients')
        .update({ status: 'active' })
        .eq('client_id', clientId)
        .eq('coach_id', user.id);

      if (relationshipError) {
        console.error("Relationship error:", relationshipError);
        throw relationshipError;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ registration_status: 'approved' })
        .eq('id', clientId);

      if (profileError) {
        console.error("Profile error:", profileError);
        throw profileError;
      }

      setPendingClients(prev => prev.filter(client => client.id !== clientId));
      
      toast({
        title: "Success",
        description: "Client activated successfully",
      });
    } catch (error) {
      console.error("Error updating client status:", error);
      toast({
        title: "Error",
        description: "Failed to activate client",
        variant: "destructive",
      });
    }
  };

  const filteredClients = pendingClients.filter(client => {
    const matchesSearch = (
      (client.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesService = serviceFilter === 'all' || (
      (serviceFilter === 'nutrition' && client.hasNutritionPlan) ||
      (serviceFilter === 'training' && client.hasWorkoutPlan) ||
      (serviceFilter === 'personal-training' && client.hasPersonalTraining)
    );

    return matchesSearch && matchesService;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <h1 className="text-3xl font-bold text-primary">Available Clients</h1>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="nutrition">Nutrition</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="personal-training">Personal Training</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[calc(100vh-12rem)] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      {client.full_name || "Unnamed Client"}
                    </TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {client.requested_services.map((service, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {service}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50"
                        onClick={() => handleClientResponse(client.id)}
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        Activate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredClients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      {pendingClients.length === 0 ? 
                        "No available clients found." :
                        "No clients match your search criteria."
                      }
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
