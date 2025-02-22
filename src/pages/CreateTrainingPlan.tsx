
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Exercise } from '@/components/nutrition-training/types/exercise';
import { ExerciseCardView } from '@/components/nutrition-training/exercise/ExerciseCardView';
import { ExerciseListView } from '@/components/nutrition-training/exercise/ExerciseListView';

export default function CreateTrainingPlan() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [muscleGroupFilter, setMuscleGroupFilter] = useState<string>('All');

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: exercises, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('coach_id', user.id);

      if (error) throw error;
      setAvailableExercises(exercises || []);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      toast({
        title: "Error",
        description: "Failed to load exercises",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('training_plan_templates')
        .insert([
          {
            coach_id: user.id,
            name,
            description,
            exercises: selectedExercises.map(ex => ex.id),
            exercise_details: selectedExercises
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Training plan created successfully",
      });

      navigate('/nutrition-and-training');
    } catch (error) {
      console.error('Error creating training plan:', error);
      toast({
        title: "Error",
        description: "Failed to create training plan",
        variant: "destructive",
      });
    }
  };

  const handleExerciseClick = (exercise: Exercise) => {
    const isSelected = selectedExercises.some(ex => ex.id === exercise.id);
    if (isSelected) {
      setSelectedExercises(selectedExercises.filter(ex => ex.id !== exercise.id));
    } else {
      setSelectedExercises([...selectedExercises, exercise]);
    }
  };

  const filteredExercises = muscleGroupFilter === 'All' 
    ? availableExercises
    : availableExercises.filter(ex => ex.muscle_group === muscleGroupFilter);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => navigate('/nutrition-and-training')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Training Plans
        </Button>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Create Training Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Plan Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter plan name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter plan description"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Exercises</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <Select value={muscleGroupFilter} onValueChange={setMuscleGroupFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by muscle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Muscles</SelectItem>
                    <SelectItem value="Shoulders">Shoulders</SelectItem>
                    <SelectItem value="Chest">Chest</SelectItem>
                    <SelectItem value="Biceps">Biceps</SelectItem>
                    <SelectItem value="Triceps">Triceps</SelectItem>
                    <SelectItem value="Abdominal">Abdominal</SelectItem>
                    <SelectItem value="Quadriceps">Quadriceps</SelectItem>
                    <SelectItem value="Hamstrings">Hamstrings</SelectItem>
                    <SelectItem value="Gluts">Gluts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Selected Exercises ({selectedExercises.length})</h3>
                <div className="space-y-2">
                  {selectedExercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="flex items-center justify-between p-2 bg-accent/10 rounded-md"
                    >
                      <span>{exercise.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExerciseClick(exercise)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Available Exercises</h3>
                <ExerciseListView
                  exercises={filteredExercises}
                  onExerciseClick={handleExerciseClick}
                />
              </div>
            </CardContent>
          </Card>
          
          <Button type="submit" disabled={!name.trim() || selectedExercises.length === 0}>
            Create Training Plan
          </Button>
        </form>
      </div>
    </div>
  );
}
