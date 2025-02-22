import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ChevronLeft, UserX } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const ClientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [healthAssessment, setHealthAssessment] = useState(null);
  const [nutritionPlan, setNutritionPlan] = useState(null);
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [latestCheckIn, setLatestCheckIn] = useState(null);

  useEffect(() => {
    const fetchClientData = async () => {
      if (!id) return;

      // Fetch health assessment
      const { data: assessmentData } = await supabase
        .from('client_health_assessments')
        .select('*')
        .eq('client_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (assessmentData) {
        setHealthAssessment(assessmentData);
      }

      // Fetch active nutrition plan
      const { data: nutritionData } = await supabase
        .from('nutrition_plans')
        .select('*')
        .eq('client_id', id)
        .eq('status', 'active')
        .single();

      if (nutritionData) {
        setNutritionPlan(nutritionData);
      }

      // Fetch active workout plan
      const { data: workoutData } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('client_id', id)
        .eq('status', 'active')
        .single();

      if (workoutData) {
        setWorkoutPlan(workoutData);
      }

      // Fetch latest check-in
      const { data: checkInData } = await supabase
        .from('weekly_checkins')
        .select('*')
        .eq('client_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (checkInData) {
        setLatestCheckIn(checkInData);
      }
    };

    fetchClientData();
  }, [id]);

  const handleUnsubscribe = async () => {
    if (!id) return;
    
    const { error } = await supabase
      .from('coach_clients')
      .update({ status: 'inactive' })
      .eq('client_id', id);

    if (!error) {
      navigate('/clients');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50 p-6">
      <div className="max-w-[1600px] mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/clients')}
          className="mb-6"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Clients
        </Button>

        <Tabs defaultValue="profile" className="mb-6">
          <TabsList className="bg-white/50 backdrop-blur-sm border">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition Plans</TabsTrigger>
            <TabsTrigger value="workout">Workout Plans</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Latest Check-in</CardTitle>
                </CardHeader>
                <CardContent>
                  {latestCheckIn ? (
                    <div className="space-y-2">
                      <p>Weight: {latestCheckIn.weight_kg} kg</p>
                      <p>Date: {new Date(latestCheckIn.created_at).toLocaleDateString()}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No check-in data available</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Health Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  {healthAssessment ? (
                    <div className="space-y-2">
                      <p>Goals: {healthAssessment.health_goals}</p>
                      <p>Activity Level: {healthAssessment.current_activity_level}</p>
                      <p>Starting Weight: {healthAssessment.starting_weight} kg</p>
                      <p>Target Weight: {healthAssessment.target_weight} kg</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No health assessment available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="nutrition">
            <Card>
              <CardHeader>
                <CardTitle>Active Nutrition Plan</CardTitle>
              </CardHeader>
              <CardContent>
                {nutritionPlan ? (
                  <div className="space-y-2">
                    <p className="font-semibold">{nutritionPlan.title}</p>
                    <p>{nutritionPlan.description}</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <p>Calories: {nutritionPlan.calories_target}</p>
                      <p>Protein: {nutritionPlan.protein_target}g</p>
                      <p>Carbs: {nutritionPlan.carbs_target}g</p>
                      <p>Fats: {nutritionPlan.fats_target}g</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No active nutrition plan</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workout">
            <Card>
              <CardHeader>
                <CardTitle>Active Workout Plan</CardTitle>
              </CardHeader>
              <CardContent>
                {workoutPlan ? (
                  <div className="space-y-2">
                    <p className="font-semibold">{workoutPlan.title}</p>
                    <p>{workoutPlan.description}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No active workout plan</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardContent className="pt-6">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleUnsubscribe}
                >
                  <UserX className="w-4 h-4 mr-2" />
                  Unsubscribe Client
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientProfile;
