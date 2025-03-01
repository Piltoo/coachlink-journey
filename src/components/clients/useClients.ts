import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Client } from "./types";

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchClients = async () => {
    try {
      console.log("Starting to fetch clients...");
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("Auth error:", userError);
        throw userError;
      }
      
      if (!user) {
        console.error("No authenticated user found");
        throw new Error("No authenticated user");
      }

      // Verify coach role using the updated RLS policy approach
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        throw profileError;
      }

      if (!userProfile || userProfile.role !== 'coach') {
        console.error("Access denied: User is not a coach");
        toast({
          title: "Access Denied",
          description: "Only coaches can access client management",
          variant: "destructive",
        });
        setClients([]);
        return;
      }

      console.log("Fetching client relationships...");
      const { data: clientRelationships, error: clientsError } = await supabase
        .from('coach_clients')
        .select('client_id, status, requested_services')
        .eq('coach_id', user.id)
        .eq('status', statusFilter);

      if (clientsError) {
        console.error("Error fetching client relationships:", clientsError);
        throw clientsError;
      }

      if (!clientRelationships || clientRelationships.length === 0) {
        console.log("No client relationships found");
        setClients([]);
        return;
      }

      console.log("Found client relationships:", clientRelationships);

      // Get the client profiles
      const { data: clientProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', clientRelationships.map(rel => rel.client_id));

      if (profilesError) {
        console.error("Error fetching client profiles:", profilesError);
        throw profilesError;
      }

      if (!clientProfiles || clientProfiles.length === 0) {
        console.log("No client profiles found");
        setClients([]);
        return;
      }

      console.log("Found client profiles:", clientProfiles);

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

      console.log("Final processed clients:", clientsWithPlans);
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
  }, [statusFilter]);

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
