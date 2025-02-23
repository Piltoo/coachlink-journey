
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
    console.log("Starting signup process with data:", { 
      email, 
      fullName, 
      selectedServices 
    });
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: "client",
          requested_services: selectedServices
        },
        emailRedirectTo: `${window.location.origin}/auth`
      }
    });

    if (signUpError) {
      console.error("Signup error:", signUpError);
      throw new Error(signUpError.message);
    }

    if (!signUpData.user) {
      console.error("No user data returned");
      throw new Error("No user data returned from signup");
    }

    console.log("Signup successful:", {
      userId: signUpData.user.id,
      email: signUpData.user.email,
      metadata: signUpData.user.user_metadata
    });
    
    return signUpData;
  } catch (error) {
    console.error("Error in signUpUser:", error);
    throw error;
  }
};
