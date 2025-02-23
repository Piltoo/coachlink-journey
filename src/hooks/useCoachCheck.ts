
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCoachCheck = () => {
  const [isCoach, setIsCoach] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkCoachStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsCoach(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;
        
        if (!profile) {
          toast({
            title: "Error",
            description: "Profile not found",
            variant: "destructive",
          });
          setIsCoach(false);
          return;
        }

        setIsCoach(profile.role === 'coach');
      } catch (error: any) {
        console.error('Error checking coach status:', error);
        toast({
          title: "Error",
          description: "Failed to verify coach status",
          variant: "destructive",
        });
        setIsCoach(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkCoachStatus();
  }, []);

  return { isCoach, isLoading };
};
