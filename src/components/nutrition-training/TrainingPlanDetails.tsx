import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Send, GripVertical, Save, X, ArrowRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

interface Exercise {
  id: string;
  name: string;
  description: string;
  muscle_group: string;
  equipment_needed?: string;
  sets?: number;
  reps?: number;
  weight?: number;
  order_index: number;
}

interface TrainingPlanDetailsProps {
  plan: {
    id: string;
    name: string;
    description: string;
    exercises?: string[];
  };
  isOpen: boolean;
  onClose: () => void;
}

interface TrainingPlanTemplate {
  id: string;
  name: string;
  description: string;
  exercises: string[];
  exercise_details?: Array<{
    exercise_id: string;
    sets: number;
    reps: number;
    weight: number;
    order_index: number;
  }>;
  coach_id: string;
  created_at: string;
  updated_at: string;
}

export function TrainingPlanDetails({ plan, isOpen, onClose }: TrainingPlanDetailsProps) {
  const [clients, setClients] = useState<{ id: string; full_name: string }[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [openPopoverIndex, setOpenPopoverIndex] = useState<number | null>(null);
  const [selectedReplacement, setSelectedReplacement] = useState<{ index: number; exercise: Exercise | null }>({
    index: -1,
    exercise: null
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchClients();
      fetchExercises();
      fetchAllExercises();
    }
  }, [isOpen, plan.id, plan.exercises]);

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

  const fetchExercises = async () => {
    if (!plan.exercises?.length) return;
    
    try {
      const { data: templateData, error: templateError } = await supabase
        .from('training_plan_templates')
        .select('*')
        .eq('id', plan.id)
        .single();

      if (templateError) throw templateError;

      const template = templateData as TrainingPlanTemplate;

      const { data, error } = await supabase
        .from('exercises')
        .select('id, name, description, muscle_group')
        .in('id', plan.exercises);

      if (error) throw error;

      const orderedExercises = plan.exercises.map((exerciseId, index) => {
        const exerciseData = data.find(e => e.id === exerciseId);
        const savedDetails = template.exercise_details?.find(
          d => d.exercise_id === exerciseId
        );
        
        if (exerciseData) {
          return {
            ...exerciseData,
            sets: savedDetails?.sets || 3,
            reps: savedDetails?.reps || 12,
            weight: savedDetails?.weight || 0,
            order_index: savedDetails?.order_index ?? index
          };
        }
        return null;
      }).filter(e => e !== null) as Exercise[];

      orderedExercises.sort((a, b) => a.order_index - b.order_index);
      setExercises(orderedExercises);
    } catch (error) {
      console.error('Error in fetchExercises:', error);
      toast({
        title: "Error",
        description: "Failed to fetch exercises",
        variant: "destructive",
      });
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

  const handleExerciseChange = (index: number, field: 'sets' | 'reps' | 'weight', value: string) => {
    const numValue = parseInt(value) || 0;
    const newExercises = [...exercises];
    newExercises[index] = {
      ...newExercises[index],
      [field]: numValue
    };
    setExercises(newExercises);
  };

  const handleSaveChanges = async () => {
    try {
      const exerciseDetails = exercises.map(exercise => ({
        exercise_id: exercise.id,
        sets: exercise.sets || 3,
        reps: exercise.reps || 12,
        weight: exercise.weight || 0,
        order_index: exercise.order_index
      }));

      const exerciseIds = exercises.map(e => e.id);

      const { error } = await supabase
        .from('training_plan_templates')
        .update({
          exercises: exerciseIds,
          exercise_details: exerciseDetails,
          updated_at: new Date().toISOString()
        })
        .eq('id', plan.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Training plan updated successfully",
      });
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
          sets: exercise.sets || 3,
          reps: exercise.reps || 12,
          weight: exercise.weight || 0,
          order_index: exercise.order_index
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

  const confirmReplacement = () => {
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
      <DialogContent className="sm:max-w-[600px]">
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
            {exercises.length > 0 ? (
              <ScrollArea className="h-[300px] border rounded-md p-4">
                {exercises.map((exercise, index) => (
                  <div
                    key={exercise.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className="flex items-center gap-4 p-2 border-b last:border-b-0 cursor-move hover:bg-accent/5"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 space-y-2">
                      <Popover 
                        open={openPopoverIndex === index} 
                        onOpenChange={(open) => {
                          if (!open) {
                            setSelectedReplacement({ index: -1, exercise: null });
                          }
                          setOpenPopoverIndex(open ? index : null);
                        }}
                      >
                        <PopoverTrigger asChild>
                          <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
                            <div className="text-left">
                              <h5 className="font-medium">{exercise.name}</h5>
                              <p className="text-sm text-muted-foreground">
                                Equipment: {exercise.equipment_needed || 'No equipment needed'}
                              </p>
                            </div>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0">
                          <div className="p-4 border-b">
                            <h4 className="font-medium text-sm">Select a replacement exercise</h4>
                          </div>
                          <ScrollArea className="h-[300px]">
                            <div className="p-2">
                              {availableExercises
                                .filter(e => e.muscle_group === exercise.muscle_group && e.id !== exercise.id)
                                .map(e => (
                                  <div
                                    key={e.id}
                                    className="flex items-center justify-between p-2 hover:bg-accent/5 rounded-md"
                                  >
                                    <span className="font-medium">{e.name}</span>
                                    <Checkbox 
                                      checked={selectedReplacement.exercise?.id === e.id}
                                      onCheckedChange={(checked) => handleReplaceSelection(index, e, checked as boolean)}
                                    />
                                  </div>
                                ))}
                            </div>
                          </ScrollArea>
                          {selectedReplacement.exercise && (
                            <div className="p-2 border-t">
                              <Button 
                                className="w-full" 
                                onClick={confirmReplacement}
                              >
                                Replace with {selectedReplacement.exercise.name} <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveExercise(index)}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-center">
                        <label className="text-xs text-muted-foreground">Sets</label>
                        <input
                          type="number"
                          value={exercise.sets}
                          onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                          className="w-16 p-1 border rounded text-center"
                          min="0"
                        />
                      </div>
                      <div className="flex flex-col items-center">
                        <label className="text-xs text-muted-foreground">Reps</label>
                        <input
                          type="number"
                          value={exercise.reps}
                          onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                          className="w-16 p-1 border rounded text-center"
                          min="0"
                        />
                      </div>
                      <div className="flex flex-col items-center">
                        <label className="text-xs text-muted-foreground">Weight</label>
                        <input
                          type="number"
                          value={exercise.weight}
                          onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
                          className="w-16 p-1 border rounded text-center"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No exercises added to this plan yet.
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSaveChanges} variant="outline" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>

          <div>
            <h4 className="font-medium mb-2">Send to Client</h4>
            <select
              className="w-full p-2 border rounded-md"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.full_name}
                </option>
              ))}
            </select>
          </div>

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
