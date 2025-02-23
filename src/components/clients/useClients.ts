
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Client } from "./types";

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
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

      // First get all active client relationships
      const { data: clientRelationships, error: clientsError } = await supabase
        .from('coach_clients')
        .select('client_id, status, requested_services')
        .eq('coach_id', user.id)
        .neq('status', 'not_connected');

      if (clientsError) throw clientsError;

      if (!clientRelationships || clientRelationships.length === 0) {
        setClients([]);
        return;
      }

      // Then get the client profiles
      const { data: clientProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', clientRelationships.map(rel => rel.client_id));

      if (profilesError) throw profilesError;

      if (!clientProfiles) {
        setClients([]);
        return;
      }

      // Get additional plan information for each client
      const clientsWithPlans = await Promise.all(
        clientProfiles.map(async (profile) => {
          const relationship = clientRelationships.find(rel => rel.client_id === profile.id);
          
          const [nutritionPlan, workoutPlan, workoutSession] = await Promise.all([
            supabase
              .from('nutrition_plans')
              .select('id')
              .eq('client_id', profile.id)
              .maybeSingle(),
            supabase
              .from('workout_plans')
              .select('id')
              .eq('client_id', profile.id)
              .maybeSingle(),
            supabase
              .from('workout_sessions')
              .select('id')
              .eq('client_id', profile.id)
              .maybeSingle()
          ]);

          return {
            id: profile.id,
            full_name: profile.full_name,
            email: profile.email,
            status: relationship?.status || 'not_connected',
            hasNutritionPlan: !!nutritionPlan.data,
            hasWorkoutPlan: !!workoutPlan.data,
            hasPersonalTraining: !!workoutSession.data,
            requested_services: relationship?.requested_services || []
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
