
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Send, GripVertical, Save } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Exercise {
  id: string;
  name: string;
  description: string;
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

export function TrainingPlanDetails({ plan, isOpen, onClose }: TrainingPlanDetailsProps) {
  const [clients, setClients] = useState<{ id: string; full_name: string }[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchClients();
      fetchExercises();
    }
  }, [isOpen, plan.exercises]);

  const fetchExercises = async () => {
    if (!plan.exercises?.length) return;
    
    const { data, error } = await supabase
      .from('exercises')
      .select('id, name, description')
      .in('id', plan.exercises);

    if (error) {
      console.error('Error fetching exercises:', error);
      return;
    }

    const orderedExercises = data.map((exercise, index) => ({
      ...exercise,
      order_index: index,
      sets: 3, // Default values
      reps: 12,
      weight: 0
    }));

    setExercises(orderedExercises);
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

  const handleExerciseChange = (index: number, field: 'sets' | 'reps' | 'weight', value: number) => {
    const newExercises = [...exercises];
    newExercises[index] = {
      ...newExercises[index],
      [field]: value
    };
    setExercises(newExercises);
  };

  const handleSaveChanges = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const updates = {
        exercises: exercises.map(e => e.id) as string[],
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('training_plan_templates')
        .update(updates)
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

      // First save all exercise details
      const exerciseDetails = exercises.map(exercise => ({
        exercise_id: exercise.id,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight,
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
            <ScrollArea className="h-[300px] border rounded-md p-4">
              {exercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className="flex items-center gap-4 p-2 border-b last:border-b-0 cursor-move"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <h5 className="font-medium">{exercise.name}</h5>
                    <p className="text-sm text-muted-foreground">{exercise.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={exercise.sets}
                      onChange={(e) => handleExerciseChange(index, 'sets', parseInt(e.target.value))}
                      className="w-16 p-1 border rounded"
                      placeholder="Sets"
                    />
                    <input
                      type="number"
                      value={exercise.reps}
                      onChange={(e) => handleExerciseChange(index, 'reps', parseInt(e.target.value))}
                      className="w-16 p-1 border rounded"
                      placeholder="Reps"
                    />
                    <input
                      type="number"
                      value={exercise.weight}
                      onChange={(e) => handleExerciseChange(index, 'weight', parseInt(e.target.value))}
                      className="w-16 p-1 border rounded"
                      placeholder="Weight"
                    />
                  </div>
                </div>
              ))}
            </ScrollArea>
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

          <Button onClick={handleSendToClient} className="w-full">
            <Send className="w-4 h-4 mr-2" />
            Send to Client
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
