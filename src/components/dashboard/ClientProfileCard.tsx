
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  Scale,
  Target,
  Utensils,
  Dumbbell,
  UserX
} from "lucide-react";

type ClientProfileCardProps = {
  clientId: string;
  onUnsubscribe: () => void;
};

type HealthAssessment = {
  health_goals: string;
  current_activity_level: string;
  starting_weight: number;
  target_weight: number;
};

type NutritionPlan = {
  title: string;
  description: string;
  calories_target: number;
  protein_target: number;
  carbs_target: number;
  fats_target: number;
};

type WorkoutPlan = {
  title: string;
  description: string;
};

export const ClientProfileCard = ({ clientId, onUnsubscribe }: ClientProfileCardProps) => {
  const [healthAssessment, setHealthAssessment] = useState<HealthAssessment | null>(null);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [latestCheckIn, setLatestCheckIn] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchClientData = async () => {
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

      // Fetch active nutrition plan
      const { data: nutritionData } = await supabase
        .from('nutrition_plans')
        .select('*')
        .eq('client_id', clientId)
        .eq('status', 'active')
        .single();

      if (nutritionData) {
        setNutritionPlan(nutritionData);
      }

      // Fetch active workout plan
      const { data: workoutData } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('client_id', clientId)
        .eq('status', 'active')
        .single();

      if (workoutData) {
        setWorkoutPlan(workoutData);
      }

      // Fetch latest check-in
      const { data: checkInData } = await supabase
        .from('weekly_checkins')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (checkInData) {
        setLatestCheckIn(checkInData);
      }
    };

    fetchClientData();
  }, [clientId]);

  const handleUnsubscribe = async () => {
    const { error } = await supabase
      .from('coach_clients')
      .update({ status: 'inactive' })
      .eq('client_id', clientId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to unsubscribe client",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Client unsubscribed successfully",
    });
    onUnsubscribe();
  };

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5" />
              Latest Check-in
            </CardTitle>
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
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Health Assessment
            </CardTitle>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="w-5 h-5" />
              Active Nutrition Plan
            </CardTitle>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5" />
              Active Workout Plan
            </CardTitle>
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

        <div className="md:col-span-2">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleUnsubscribe}
          >
            <UserX className="w-4 h-4 mr-2" />
            Unsubscribe Client
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
};
