import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Send, Save } from "lucide-react";
import { ExerciseList } from "./training-plan/ExerciseList";
import { ClientSelect } from "./training-plan/ClientSelect";
import { Exercise, SelectedReplacement, TrainingPlanDetailsProps } from "./types/training";

export function TrainingPlanDetails({ plan, isOpen, onClose, onUpdate }: TrainingPlanDetailsProps) {
  const [clients, setClients] = useState<{ id: string; full_name: string }[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [openPopoverIndex, setOpenPopoverIndex] = useState<number | null>(null);
  const [selectedReplacement, setSelectedReplacement] = useState<SelectedReplacement>({
    index: -1,
    exercise: null
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchClients();
      initializeExercises();
      fetchAllExercises();
    }
  }, [isOpen, plan]);

  const initializeExercises = () => {
    if (plan.exercise_details && Array.isArray(plan.exercise_details)) {
      const initialExercises = plan.exercise_details.map((detail: any) => ({
        id: detail.exercise_id,
        name: detail.name,
        sets: detail.sets || 3,
        reps: detail.reps || 12,
        weight: detail.weight || 0,
        notes: detail.notes || '',
        order_index: detail.order_index || 0,
        description: detail.description || '',
        muscle_group: detail.muscle_group || '',
        equipment_needed: detail.equipment_needed || '',
        difficulty_level: detail.difficulty_level || 'Beginner',
        instructions: detail.instructions || ''
      }));
      setExercises(initialExercises);
    }
  };

  const fetchAllExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('id, name, description, muscle_group');

      if (error) throw error;
      
      const exercisesWithOrder = data.map(exercise => ({
        ...exercise,
        order_index: 0
      }));
      
      setAvailableExercises(exercisesWithOrder);
    } catch (error) {
      console.error('Error fetching all exercises:', error);
    }
  };

  const fetchClients = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: clientsData, error } = await supabase
      .from('coach_clients')
      .select(`
        client_id,
        profiles!coach_clients_client_id_fkey (
          id,
          full_name
        )
      `)
      .eq('coach_id', user.id);

    if (error) {
      console.error('Error fetching clients:', error);
      return;
    }

    const formattedClients = clientsData
      .filter(c => c.profiles)
      .map(c => ({
        id: c.profiles.id,
        full_name: c.profiles.full_name || 'Unnamed Client'
      }));

    setClients(formattedClients);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newExercises = [...exercises];
    const draggedExercise = newExercises[draggedIndex];
    newExercises.splice(draggedIndex, 1);
    newExercises.splice(index, 0, draggedExercise);
    
    newExercises.forEach((exercise, idx) => {
      exercise.order_index = idx;
    });

    setExercises(newExercises);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleExerciseChange = (index: number, field: 'sets' | 'reps' | 'weight' | 'notes', value: string) => {
    const numValue = parseInt(value) || 0;
    const newExercises = [...exercises];
    newExercises[index] = {
      ...newExercises[index],
      [field]: field === 'notes' ? value : numValue
    };
    setExercises(newExercises);
  };

  const handleSaveChanges = async () => {
    try {
      const exerciseDetails = exercises.map((exercise, index) => ({
        exercise_id: exercise.id,
        name: exercise.name,
        sets: exercise.sets || 3,
        reps: exercise.reps || 12,
        weight: exercise.weight || 0,
        notes: exercise.notes || '',
        order_index: index,
        description: exercise.description,
        muscle_group: exercise.muscle_group,
        equipment_needed: exercise.equipment_needed,
        difficulty_level: exercise.difficulty_level,
        instructions: exercise.instructions
      }));

      const { error } = await supabase
        .from('training_plan_templates')
        .update({
          exercise_details: exerciseDetails,
          updated_at: new Date().toISOString()
        })
        .eq('id', plan.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Training plan updated successfully",
      });

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating training plan:', error);
      toast({
        title: "Error",
        description: "Failed to update training plan",
        variant: "destructive",
      });
    }
  };

  const handleSendToClient = async () => {
    if (!selectedClientId) {
      toast({
        title: "Error",
        description: "Please select a client",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const exerciseDetails = exercises
        .sort((a, b) => a.order_index - b.order_index)
        .map(exercise => ({
          exercise_id: exercise.id,
          name: exercise.name,
          sets: exercise.sets || 3,
          reps: exercise.reps || 12,
          weight: exercise.weight || 0,
          notes: exercise.notes || '',
          order_index: exercise.order_index,
          description: exercise.description,
          muscle_group: exercise.muscle_group,
          equipment_needed: exercise.equipment_needed,
          difficulty_level: exercise.difficulty_level,
          instructions: exercise.instructions
        }));

      const { error: planError } = await supabase
        .from('workout_plans')
        .insert([
          {
            title: plan.name,
            description: plan.description,
            coach_id: user.id,
            client_id: selectedClientId,
            status: 'active',
            program_details: {
              exercises: exerciseDetails
            }
          }
        ]);

      if (planError) throw planError;

      toast({
        title: "Success",
        description: "Training plan sent to client successfully",
      });
      
      onClose();
    } catch (error) {
      console.error('Error sending plan to client:', error);
      toast({
        title: "Error",
        description: "Failed to send training plan to client",
        variant: "destructive",
      });
    }
  };

  const handleDeletePlan = async () => {
    try {
      const { error } = await supabase
        .from('training_plan_templates')
        .delete()
        .eq('id', plan.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Training plan deleted successfully",
      });
      
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error deleting training plan:', error);
      toast({
        title: "Error",
        description: "Failed to delete training plan",
        variant: "destructive",
      });
    }
  };

  const handleReplaceSelection = (index: number, newExercise: Exercise, checked: boolean) => {
    if (checked) {
      setSelectedReplacement({ index, exercise: newExercise });
    } else {
      setSelectedReplacement({ index: -1, exercise: null });
    }
  };

  const handleConfirmReplacement = () => {
    if (selectedReplacement.exercise && selectedReplacement.index !== -1) {
      const updatedExercises = [...exercises];
      const oldExercise = updatedExercises[selectedReplacement.index];
      
      updatedExercises[selectedReplacement.index] = {
        ...selectedReplacement.exercise,
        sets: oldExercise.sets || 3,
        reps: oldExercise.reps || 12,
        weight: oldExercise.weight || 0,
        order_index: oldExercise.order_index
      };

      setExercises(updatedExercises);
      setOpenPopoverIndex(null);
      setSelectedReplacement({ index: -1, exercise: null });
      
      toast({
        title: "Exercise replaced",
        description: "The exercise has been successfully replaced.",
      });
    }
  };

  const handleRemoveExercise = (index: number) => {
    const updatedExercises = exercises.filter((_, i) => i !== index);
    updatedExercises.forEach((exercise, idx) => {
      exercise.order_index = idx;
    });
    setExercises(updatedExercises);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] w-[95vw]">
        <DialogHeader>
          <DialogTitle>{plan.name}</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">{plan.description}</p>
          </div>

          <div>
            <h4 className="font-medium mb-2">Exercises</h4>
            <ExerciseList
              exercises={exercises}
              availableExercises={availableExercises}
              draggedIndex={draggedIndex}
              openPopoverIndex={openPopoverIndex}
              selectedReplacement={selectedReplacement}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onExerciseChange={handleExerciseChange}
              onPopoverChange={setOpenPopoverIndex}
              onReplaceSelection={handleReplaceSelection}
              onConfirmReplacement={handleConfirmReplacement}
              onRemoveExercise={handleRemoveExercise}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSaveChanges} variant="outline" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>

          <ClientSelect
            clients={clients}
            selectedClientId={selectedClientId}
            onClientSelect={setSelectedClientId}
          />

          <div className="flex gap-2">
            <Button 
              variant="destructive" 
              onClick={handleDeletePlan}
              className="flex-1"
            >
              Delete Plan
            </Button>
            <Button onClick={handleSendToClient} className="flex-1">
              <Send className="w-4 h-4 mr-2" />
              Send to Client
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
