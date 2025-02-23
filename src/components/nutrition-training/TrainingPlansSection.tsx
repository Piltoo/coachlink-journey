
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TrainingPlanDetails } from "./TrainingPlanDetails";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

type Exercise = {
  id: string;
  name: string;
  description: string;
  muscle_group: string;
  start_position_image: string | null;
  mid_position_image: string | null;
  difficulty_level: string;
  equipment_needed: string | null;
  instructions: string;
};

export function TrainingPlansSection() {
  const navigate = useNavigate();
  const [trainingPlans, setTrainingPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTrainingPlans();
  }, []);

  const fetchTrainingPlans = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('training_plan_templates')
        .select('*')
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // The exercise_details is already included in the response as a JSONB column
      setTrainingPlans(data || []);
    } catch (error) {
      console.error('Error fetching training plans:', error);
      toast({
        title: "Error",
        description: "Failed to load training plans",
        variant: "destructive",
      });
    }
  };

  const getExerciseCount = (plan: any) => {
    if (plan.exercise_details && Array.isArray(plan.exercise_details)) {
      return plan.exercise_details.length;
    }
    return 0;
  };

  const handlePlanUpdate = () => {
    fetchTrainingPlans(); // Refresh the plans after an update
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Training Plans</h2>
        <Button onClick={() => navigate("/nutrition-and-training/create-training-plan")}>
          <Plus className="w-4 h-4 mr-2" />
          Create Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trainingPlans.map((plan) => (
          <Card 
            key={plan.id} 
            className="cursor-pointer hover:bg-accent/5 transition-colors"
            onClick={() => setSelectedPlan(plan)}
          >
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{plan.name}</span>
                <Badge variant="secondary">
                  {getExerciseCount(plan)} exercises
                </Badge>
              </CardTitle>
              <CardDescription>
                Created on {new Date(plan.created_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {plan.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedPlan && (
        <TrainingPlanDetails
          plan={selectedPlan}
          isOpen={!!selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onUpdate={handlePlanUpdate}
        />
      )}
    </div>
  );
}
