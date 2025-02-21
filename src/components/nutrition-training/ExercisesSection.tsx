
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

type ExercisesSectionProps = {
  exercises: Exercise[];
  onExerciseChange: () => void;
};

const muscleGroups = [
  "Legs",
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Core",
  "Full Body",
];

const difficultyLevels = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

export function ExercisesSection({ exercises, onExerciseChange }: ExercisesSectionProps) {
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showEditExercise, setShowEditExercise] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
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

  return (
    <div className="bg-white/40 backdrop-blur-lg rounded-lg border border-gray-200/50 p-6 shadow-sm transition-all duration-200 ease-in-out">
      <div className="flex justify-between items-center mb-6">
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
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Exercise Name</Label>
                  <Input
                    id="name"
                    value={newExercise.name}
                    onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                    placeholder="Enter exercise name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="muscle-group">Muscle Group</Label>
                  <Select
                    value={newExercise.muscle_group}
                    onValueChange={(value) => setNewExercise({ ...newExercise, muscle_group: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select muscle group" />
                    </SelectTrigger>
                    <SelectContent>
                      {muscleGroups.map((group) => (
                        <SelectItem key={group} value={group}>{group}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={newExercise.difficulty_level}
                    onValueChange={(value) => setNewExercise({ ...newExercise, difficulty_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyLevels.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="equipment">Equipment Needed</Label>
                  <Input
                    id="equipment"
                    value={newExercise.equipment_needed}
                    onChange={(e) => setNewExercise({ ...newExercise, equipment_needed: e.target.value })}
                    placeholder="Required equipment"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Short Description</Label>
                <Textarea
                  id="description"
                  value={newExercise.description}
                  onChange={(e) => setNewExercise({ ...newExercise, description: e.target.value })}
                  placeholder="Brief description of the exercise"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructions">Detailed Instructions</Label>
                <Textarea
                  id="instructions"
                  value={newExercise.instructions}
                  onChange={(e) => setNewExercise({ ...newExercise, instructions: e.target.value })}
                  placeholder="Step-by-step instructions"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-image">Start Position Image URL</Label>
                  <Input
                    id="start-image"
                    value={newExercise.start_position_image}
                    onChange={(e) => setNewExercise({ ...newExercise, start_position_image: e.target.value })}
                    placeholder="URL for starting position"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mid-image">Mid Position Image URL</Label>
                  <Input
                    id="mid-image"
                    value={newExercise.mid_position_image}
                    onChange={(e) => setNewExercise({ ...newExercise, mid_position_image: e.target.value })}
                    placeholder="URL for mid position"
                  />
                </div>
              </div>
              <Button onClick={handleAddExercise} className="w-full bg-[#a7cca4] hover:bg-[#96bb93] text-white">
                Add Exercise
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {exercises.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="p-4 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg transition-all duration-200 ease-in-out cursor-pointer hover:bg-white/80"
              onClick={() => handleExerciseClick(exercise)}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-lg">{exercise.name}</h3>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    {exercise.difficulty_level}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{exercise.description}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium">Muscle Group:</span>
                  <span className="ml-2">{exercise.muscle_group}</span>
                </div>
                {exercise.equipment_needed && (
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium">Equipment:</span>
                    <span className="ml-2">{exercise.equipment_needed}</span>
                  </div>
                )}
                {(exercise.start_position_image || exercise.mid_position_image) && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {exercise.start_position_image && (
                      <img
                        src={exercise.start_position_image}
                        alt="Start position"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}
                    {exercise.mid_position_image && (
                      <img
                        src={exercise.mid_position_image}
                        alt="Mid position"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No exercises added yet.
        </div>
      )}

      <Dialog open={showEditExercise} onOpenChange={setShowEditExercise}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit or Delete Exercise</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Exercise Name</Label>
                <Input
                  id="edit-name"
                  value={editingExercise.name}
                  onChange={(e) => setEditingExercise({ ...editingExercise, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-muscle-group">Muscle Group</Label>
                <Select
                  value={editingExercise.muscle_group}
                  onValueChange={(value) => setEditingExercise({ ...editingExercise, muscle_group: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {muscleGroups.map((group) => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-difficulty">Difficulty Level</Label>
                <Select
                  value={editingExercise.difficulty_level}
                  onValueChange={(value) => setEditingExercise({ ...editingExercise, difficulty_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyLevels.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-equipment">Equipment Needed</Label>
                <Input
                  id="edit-equipment"
                  value={editingExercise.equipment_needed}
                  onChange={(e) => setEditingExercise({ ...editingExercise, equipment_needed: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Short Description</Label>
              <Textarea
                id="edit-description"
                value={editingExercise.description}
                onChange={(e) => setEditingExercise({ ...editingExercise, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-instructions">Detailed Instructions</Label>
              <Textarea
                id="edit-instructions"
                value={editingExercise.instructions}
                onChange={(e) => setEditingExercise({ ...editingExercise, instructions: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-start-image">Start Position Image URL</Label>
                <Input
                  id="edit-start-image"
                  value={editingExercise.start_position_image}
                  onChange={(e) => setEditingExercise({ ...editingExercise, start_position_image: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-mid-image">Mid Position Image URL</Label>
                <Input
                  id="edit-mid-image"
                  value={editingExercise.mid_position_image}
                  onChange={(e) => setEditingExercise({ ...editingExercise, mid_position_image: e.target.value })}
                />
              </div>
            </div>
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
