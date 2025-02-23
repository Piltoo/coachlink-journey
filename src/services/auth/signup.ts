
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
  try {
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

    if (signUpError) {
      console.error("Signup error:", signUpError);
      throw signUpError;
    }

    if (!signUpData.user) {
      throw new Error("No user data returned from signup");
    }

    return signUpData;
  } catch (error) {
    console.error("Error in signUpUser:", error);
    throw error;
  }
};
