
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface ClientProfileCardProps {
  clientId: string;
  onUnsubscribe?: () => void;
}

export const ClientProfileCard = ({ clientId, onUnsubscribe }: ClientProfileCardProps) => {
  const [profile, setProfile] = useState<any>(null);
  const [healthAssessment, setHealthAssessment] = useState<any>(null);

  useEffect(() => {
    const fetchClientData = async () => {
      // Fetch client profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', clientId)
        .single();

      if (profileData) {
        setProfile(profileData);
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
        setHealthAssessment(assessmentData);
      }
    };

    fetchClientData();
  }, [clientId]);

  if (!profile) {
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
            <p>Name: {profile.full_name}</p>
            <p>Email: {profile.email}</p>
          </div>
        </CardContent>
      </Card>

      {healthAssessment && (
        <Card>
          <CardHeader>
            <CardTitle>Health Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>Goals: {healthAssessment.health_goals}</p>
              <p>Activity Level: {healthAssessment.current_activity_level}</p>
              <p>Starting Weight: {healthAssessment.starting_weight} kg</p>
              <p>Target Weight: {healthAssessment.target_weight} kg</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
