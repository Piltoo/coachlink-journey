
import { supabase } from "@/integrations/supabase/client";

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  selectedServices: string[];
}

export const signUpUser = async ({
  email,
  password,
  fullName,
  selectedServices,
}: SignUpData) => {
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: "client",
        requested_services: selectedServices
      }
    }
  });

  if (signUpError) throw signUpError;

  if (!signUpData.user) {
    throw new Error("No user data returned from signup");
  }

  // Insert into profiles table
  const { error: profileError } = await supabase.from("profiles").insert({
    id: signUpData.user.id,
    email: email,
    full_name: fullName,
    role: "client",
    registration_status: "pending",
    requested_services: selectedServices,
  });

  if (profileError) throw profileError;

  // Get all coaches
  const { data: coaches, error: coachesError } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "coach");

  if (coachesError) throw coachesError;

  // Create coach-client relationships if there are any coaches
  if (coaches && coaches.length > 0) {
    const coachClientRelations = coaches.map((coach) => ({
      client_id: signUpData.user.id,
      coach_id: coach.id,
      requested_services: selectedServices,
      status: "not_connected",
    }));

    const { error: relationshipError } = await supabase
      .from("coach_clients")
      .insert(coachClientRelations);

    if (relationshipError) throw relationshipError;
  }

  return signUpData;
};
