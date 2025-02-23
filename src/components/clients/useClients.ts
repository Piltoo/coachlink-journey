
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [selectedClientId, setSelectedClientId] = useState(null);
  const { toast } = useToast();

  const fetchClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Verify coach role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      if (profile?.role !== 'coach') {
        toast({
          title: "Access Denied",
          description: "Only coaches can access client management",
          variant: "destructive",
        });
        return;
      }

      const { data: activeClients, error: clientsError } = await supabase
        .from('coach_clients')
        .select(`
          client_id,
          status,
          requested_services,
          profiles:client_id (
            id,
            full_name,
            email,
            role
          )
        `)
        .eq('coach_id', user.id)
        .neq('status', 'not_connected');

      if (clientsError) throw clientsError;

      // Get additional plan information for each client
      const clientsWithPlans = await Promise.all(
        activeClients.map(async (client) => {
          const [nutritionPlan, workoutPlan, workoutSession] = await Promise.all([
            supabase
              .from('nutrition_plans')
              .select('id')
              .eq('client_id', client.client_id)
              .maybeSingle(),
            supabase
              .from('workout_plans')
              .select('id')
              .eq('client_id', client.client_id)
              .maybeSingle(),
            supabase
              .from('workout_sessions')
              .select('id')
              .eq('client_id', client.client_id)
              .maybeSingle()
          ]);

          return {
            id: client.client_id,
            full_name: client.profiles.full_name,
            email: client.profiles.email,
            status: client.status,
            hasNutritionPlan: !!nutritionPlan.data,
            hasWorkoutPlan: !!workoutPlan.data,
            hasPersonalTraining: !!workoutSession.data,
            requested_services: client.requested_services || []
          };
        })
      );

      setClients(clientsWithPlans);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: "Failed to load clients",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return {
    clients,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    serviceFilter,
    setServiceFilter,
    selectedClientId,
    setSelectedClientId,
    fetchClients
  };
};
