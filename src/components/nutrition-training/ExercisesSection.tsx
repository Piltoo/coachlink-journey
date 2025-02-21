
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Exercise, muscleGroups } from "./types/exercise";
import { ExerciseListView } from "./exercise/ExerciseListView";
import { ExerciseCardView } from "./exercise/ExerciseCardView";
import { ExerciseForm } from "./exercise/ExerciseForm";

interface ExercisesSectionProps {
  exercises: Exercise[];
  onExerciseChange: () => void;
}

export function ExercisesSection({ exercises, onExerciseChange }: ExercisesSectionProps) {
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showEditExercise, setShowEditExercise] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("All");
  const [newExercise, setNewExercise] = useState({
    name: "",
    description: "",
    muscle_group: "",
    difficulty_level: "",
    equipment_needed: "",
    instructions: "",
    start_position_image: "",
    mid_position_image: "",
  });
  const [editingExercise, setEditingExercise] = useState({
    name: "",
    description: "",
    muscle_group: "",
    difficulty_level: "",
    equipment_needed: "",
    instructions: "",
    start_position_image: "",
    mid_position_image: "",
  });
  const { toast } = useToast();

  const handleAddExercise = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from('exercises')
        .insert([{
          ...newExercise,
          coach_id: user.id,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Exercise added successfully",
      });

      setShowAddExercise(false);
      setNewExercise({
        name: "",
        description: "",
        muscle_group: "",
        difficulty_level: "",
        equipment_needed: "",
        instructions: "",
        start_position_image: "",
        mid_position_image: "",
      });
      onExerciseChange();
    } catch (error) {
      console.error("Error adding exercise:", error);
      toast({
        title: "Error",
        description: "Failed to add exercise",
        variant: "destructive",
      });
    }
  };

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setEditingExercise({
      name: exercise.name,
      description: exercise.description,
      muscle_group: exercise.muscle_group,
      difficulty_level: exercise.difficulty_level,
      equipment_needed: exercise.equipment_needed || "",
      instructions: exercise.instructions,
      start_position_image: exercise.start_position_image || "",
      mid_position_image: exercise.mid_position_image || "",
    });
    setShowEditExercise(true);
  };

  const handleUpdateExercise = async () => {
    if (!selectedExercise) return;

    try {
      const { error } = await supabase
        .from('exercises')
        .update(editingExercise)
        .eq('id', selectedExercise.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Exercise updated successfully",
      });

      setShowEditExercise(false);
      onExerciseChange();
    } catch (error) {
      console.error("Error updating exercise:", error);
      toast({
        title: "Error",
        description: "Failed to update exercise",
        variant: "destructive",
      });
    }
  };

  const handleDeleteExercise = async () => {
    if (!selectedExercise) return;

    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', selectedExercise.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Exercise deleted successfully",
      });

      setShowEditExercise(false);
      onExerciseChange();
    } catch (error) {
      console.error("Error deleting exercise:", error);
      toast({
        title: "Error",
        description: "Failed to delete exercise",
        variant: "destructive",
      });
    }
  };

  const filteredExercises = exercises.filter(exercise => 
    selectedMuscleGroup === "All" || exercise.muscle_group === selectedMuscleGroup
  );

  return (
    <div className="bg-white/40 backdrop-blur-lg rounded-lg border border-gray-200/50 p-6 shadow-sm transition-all duration-200 ease-in-out">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Exercise List</h2>
          <Dialog open={showAddExercise} onOpenChange={setShowAddExercise}>
            <DialogTrigger asChild>
              <Button className="bg-[#a7cca4] hover:bg-[#96bb93] text-white font-medium">
                <Plus className="mr-2 h-4 w-4" />
                Add New Exercise
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Exercise</DialogTitle>
              </DialogHeader>
              <ExerciseForm data={newExercise} onChange={setNewExercise} />
              <Button onClick={handleAddExercise} className="w-full bg-[#a7cca4] hover:bg-[#96bb93] text-white">
                Add Exercise
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-2 -mx-2 px-2">
          {muscleGroups.map((group) => (
            <Button
              key={group}
              onClick={() => setSelectedMuscleGroup(group)}
              variant="ghost"
              className={`whitespace-nowrap px-4 py-2 rounded-full transition-colors ${
                selectedMuscleGroup === group
                  ? "bg-[#a7cca4] text-white hover:bg-[#96bb93]"
                  : "text-gray-600 hover:bg-[#a7cca4]/10"
              }`}
            >
              {group}
            </Button>
          ))}
        </div>

        {filteredExercises.length > 0 ? (
          selectedMuscleGroup === "All" ? (
            <ExerciseListView 
              exercises={filteredExercises}
              onExerciseClick={handleExerciseClick}
            />
          ) : (
            <ExerciseCardView
              exercises={filteredExercises}
              onExerciseClick={handleExerciseClick}
            />
          )
        ) : (
          <div className="text-center py-12 text-gray-500">
            {selectedMuscleGroup === "All" 
              ? "No exercises added yet."
              : `No exercises found for ${selectedMuscleGroup}.`}
          </div>
        )}
      </div>

      <Dialog open={showEditExercise} onOpenChange={setShowEditExercise}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit or Delete Exercise</DialogTitle>
          </DialogHeader>
          <ExerciseForm data={editingExercise} onChange={setEditingExercise} isEdit />
          <DialogFooter className="flex justify-between gap-4 sm:justify-between">
            <Button
              variant="destructive"
              onClick={handleDeleteExercise}
              className="flex-1"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <Button
              onClick={handleUpdateExercise}
              className="flex-1 bg-[#a7cca4] hover:bg-[#96bb93] text-white"
            >
              Update Exercise
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
