import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

type Exercise = {
  id: string;
  name: string;
  description: string;
  muscle_group: string;
};

type PlanExercise = Exercise & {
  sets: number;
  reps: number;
  weight: number | null;
  notes: string;
};

type TrainingPlan = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export function TrainingPlansSection() {
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<PlanExercise[]>([]);
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('training_plan_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Error",
        description: "Failed to load training plans",
        variant: "destructive",
      });
    }
  };

  const searchExercises = async () => {
    try {
      let query = supabase
        .from('exercises')
        .select('id, name, description, muscle_group')
        .order('name');

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error searching exercises:', error);
        throw error;
      }

      console.log('Found exercises:', data);
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

  useEffect(() => {
    if (showAddExercise) {
      searchExercises();
    }
  }, [showAddExercise]);

  const handleCreatePlan = async () => {
    if (!planName.trim()) {
      toast({
        title: "Error",
        description: "Plan name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create a training plan",
          variant: "destructive",
        });
        return;
      }

      const { data: plan, error: planError } = await supabase
        .from('training_plan_templates')
        .insert([
          {
            name: planName,
            description: planDescription,
            coach_id: user.id
          }
        ])
        .select()
        .single();

      if (planError) throw planError;

      if (plan && selectedExercises.length > 0) {
        const exercisesData = selectedExercises.map((exercise, index) => ({
          plan_id: plan.id,
          exercise_id: exercise.id,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
          notes: exercise.notes,
          order_index: index
        }));

        const { error: exercisesError } = await supabase
          .from('training_plan_exercises')
          .insert(exercisesData);

        if (exercisesError) throw exercisesError;
      }

      toast({
        title: "Success",
        description: "Training plan created successfully",
      });

      setPlanName("");
      setPlanDescription("");
      setSelectedExercises([]);
      setShowCreatePlan(false);
      fetchPlans();
    } catch (error) {
      console.error('Error creating plan:', error);
      toast({
        title: "Error",
        description: "Failed to create training plan",
        variant: "destructive",
      });
    }
  };

  const addExerciseToPlan = (exercise: Exercise) => {
    setSelectedExercises([...selectedExercises, {
      ...exercise,
      sets: 3,
      reps: 12,
      weight: null,
      notes: ""
    }]);
    setShowAddExercise(false);
    setSearchTerm("");
    setExercises([]);
  };

  const updateExerciseDetails = (index: number, field: keyof PlanExercise, value: any) => {
    const updated = [...selectedExercises];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedExercises(updated);
  };

  const removeExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white/40 backdrop-blur-lg rounded-lg border border-gray-200/50 p-6 shadow-sm transition-all duration-200 ease-in-out">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Training Plans</h2>
        <Button 
          onClick={() => setShowCreatePlan(true)}
          className="bg-[#a7cca4] hover:bg-[#96bb93] text-white font-medium"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Plan
        </Button>
      </div>

      {plans.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
            >
              <h3 className="font-medium text-lg mb-2">{plan.name}</h3>
              {plan.description && (
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
              )}
              <p className="text-xs text-gray-500">
                Created {new Date(plan.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No training plans created yet.
        </div>
      )}

      <Dialog open={showCreatePlan} onOpenChange={setShowCreatePlan}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Training Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name</Label>
              <Input
                id="name"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Enter plan name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
                placeholder="Enter plan description"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Exercises</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddExercise(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Exercise
                </Button>
              </div>

              <ScrollArea className="h-[300px] rounded-md border p-4">
                {selectedExercises.map((exercise, index) => (
                  <div key={index} className="mb-4 p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{exercise.name}</h4>
                        <p className="text-sm text-gray-600">{exercise.muscle_group}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExercise(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label>Sets</Label>
                        <Input
                          type="number"
                          value={exercise.sets}
                          onChange={(e) => updateExerciseDetails(index, 'sets', parseInt(e.target.value))}
                          min={1}
                        />
                      </div>
                      <div>
                        <Label>Reps</Label>
                        <Input
                          type="number"
                          value={exercise.reps}
                          onChange={(e) => updateExerciseDetails(index, 'reps', parseInt(e.target.value))}
                          min={1}
                        />
                      </div>
                      <div>
                        <Label>Weight (kg)</Label>
                        <Input
                          type="number"
                          value={exercise.weight || ''}
                          onChange={(e) => updateExerciseDetails(index, 'weight', e.target.value ? parseFloat(e.target.value) : null)}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <Label>Notes</Label>
                      <Input
                        value={exercise.notes}
                        onChange={(e) => updateExerciseDetails(index, 'notes', e.target.value)}
                        placeholder="Optional notes"
                      />
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreatePlan(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePlan}>
                Create Plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddExercise} onOpenChange={setShowAddExercise}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Exercise to Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button onClick={searchExercises}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => addExerciseToPlan(exercise)}
                  >
                    <h4 className="font-medium">{exercise.name}</h4>
                    <p className="text-sm text-gray-600">{exercise.muscle_group}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
