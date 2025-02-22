
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type Client = {
  id: string;
  full_name: string | null;
  email: string;
  status: string;
  hasNutritionPlan: boolean;
  hasWorkoutPlan: boolean;
  hasPersonalTraining: boolean;
  requested_services: string[] | null;
};

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const { toast } = useToast();

  const fetchClients = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("No user found - user is not authenticated");
        return;
      }

      console.log("Fetching clients for coach:", user.id);

      const { data: activeRelationships, error: relationshipsError } = await supabase
        .from('coach_clients')
        .select('client_id, status, coach_id');  // Removed the status filter

      if (relationshipsError) throw relationshipsError;

      const clientsActiveWithOtherCoaches = new Set(
        activeRelationships
          ?.filter(rel => rel.coach_id !== user.id)
          .map(rel => rel.client_id) || []
      );

      const { data: coachRelationships, error: coachRelError } = await supabase
        .from('coach_clients')
        .select('client_id, status')
        .eq('coach_id', user.id);  // Removed the status filter

      if (coachRelError) throw coachRelError;

      console.log("Found coach relationships:", coachRelationships?.length);

      const coachRelationshipMap = new Map(
        coachRelationships?.map(rel => [rel.client_id, rel.status]) || []
      );

      const { data: clientProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, requested_services')
        .eq('role', 'client')
        .in('id', coachRelationships?.map(rel => rel.client_id) || []);

      if (profilesError) throw profilesError;

      console.log("Found client profiles:", clientProfiles?.length);

      if (clientProfiles) {
        const availableClients = clientProfiles.filter(
          profile => !clientsActiveWithOtherCoaches.has(profile.id)
        );

        const clientPromises = availableClients.map(async (profile) => {
          const relationshipStatus = coachRelationshipMap.get(profile.id) || 'not_connected';

          const [nutritionPlans, workoutPlans, workoutSessions] = await Promise.all([
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
              .maybeSingle(),
          ]);

          return {
            id: profile.id,
            full_name: profile.full_name,
            email: profile.email,
            status: relationshipStatus,
            hasNutritionPlan: !!nutritionPlans.data,
            hasWorkoutPlan: !!workoutPlans.data,
            hasPersonalTraining: !!workoutSessions.data,
            requested_services: profile.requested_services,
          };
        });

        const formattedClients = await Promise.all(clientPromises);
        console.log("Formatted clients:", formattedClients.length);
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
  }, [toast]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

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
