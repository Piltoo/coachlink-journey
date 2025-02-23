import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ClientProfileCardProps {
  clientId: string;
  onUnsubscribe?: () => void;
}

export function ClientProfileCard({ clientId, onUnsubscribe }: ClientProfileCardProps) {
  const [clientData, setClientData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Check if user is a coach
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role !== 'coach') {
          toast({
            title: "Access Denied",
            description: "Only coaches can view client profiles",
            variant: "destructive",
          });
          return;
        }

        // Fetch client profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', clientId)
          .single();

        if (profileData) {
          setClientData(profileData);
        }

        // Fetch health assessment
        const { data: assessmentData } = await supabase
          .from('client_health_assessments')
          .select('*')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (assessmentData) {
          setClientData({ ...clientData, healthAssessment: assessmentData });
        }
      } catch (error) {
        console.error('Error fetching client data:', error);
        toast({
          title: "Error",
          description: "Failed to load client profile",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (clientId) {
      fetchClientData();
    }
  }, [clientId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Client Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>Name: {clientData.full_name}</p>
            <p>Email: {clientData.email}</p>
          </div>
        </CardContent>
      </Card>

      {clientData.healthAssessment && (
        <Card>
          <CardHeader>
            <CardTitle>Health Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>Goals: {clientData.healthAssessment.health_goals}</p>
              <p>Activity Level: {clientData.healthAssessment.current_activity_level}</p>
              <p>Starting Weight: {clientData.healthAssessment.starting_weight} kg</p>
              <p>Target Weight: {clientData.healthAssessment.target_weight} kg</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
