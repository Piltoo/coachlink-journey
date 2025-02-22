import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TrainingPlanDetails } from "./TrainingPlanDetails";
import { useNavigate } from "react-router-dom";

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
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
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

  const handleCreatePlan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('training_plan_templates')
        .insert([
          {
            coach_id: user.id,
            name: planName,
            description: planDescription,
            exercises: selectedExercises.map(e => e.id),
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Training plan created successfully",
      });

      setPlanName("");
      setPlanDescription("");
      setSelectedExercises([]);
      setShowCreateDialog(false);
      fetchTrainingPlans();
    } catch (error) {
      console.error('Error creating training plan:', error);
      toast({
        title: "Error",
        description: "Failed to create training plan",
        variant: "destructive",
      });
    }
  };

  const searchExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .ilike('name', `%${searchTerm}%`)
        .limit(5);

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error('Error searching exercises:', error);
      toast({
        title: "Error",
        description: "Failed to search exercises",
        variant: "destructive",
      });
    }
  };

  const toggleExerciseSelection = (exercise: Exercise) => {
    if (selectedExercises.find(e => e.id === exercise.id)) {
      setSelectedExercises(selectedExercises.filter(e => e.id !== exercise.id));
    } else {
      setSelectedExercises([...selectedExercises, exercise]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Training Plans</h2>
        <Button onClick={() => navigate("/nutrition-and-training/create-plan")}>
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
              <CardTitle>{plan.name}</CardTitle>
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

      {/* Plan Details Dialog */}
      {selectedPlan && (
        <TrainingPlanDetails
          plan={selectedPlan}
          isOpen={!!selectedPlan}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </div>
  );
}
