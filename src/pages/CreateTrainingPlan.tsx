
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
import { ExerciseListView } from '@/components/nutrition-training/exercise/ExerciseListView';

type ExerciseWithDetails = Exercise & {
  sets?: number;
  reps?: number;
  weight?: number;
  notes?: string;
  isCustom?: boolean;
};

// Function to generate a deterministic UUID v4 from a string
function generateUUID(str: string): string {
  // Create a hash of the string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to hex and ensure it's exactly 12 characters
  const hashHex = Math.abs(hash).toString(16).padStart(12, '0').slice(0, 12);
  
  // Format as UUID v4 (with first part being zeros and second part being the hash)
  return `00000000-0000-4000-8000-${hashHex}`;
}

export default function CreateTrainingPlan() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<ExerciseWithDetails[]>([]);
  const [availableExercises, setAvailableExercises] = useState<ExerciseWithDetails[]>([]);
  const [muscleGroupFilter, setMuscleGroupFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [muscleGroups, setMuscleGroups] = useState<string[]>(['All']);

  const fetchMuscleGroups = async () => {
    try {
      const { data: customMuscleGroups, error: customError } = await supabase
        .from('exercises')
        .select('muscle_group')
        .not('muscle_group', 'is', null);

      if (customError) throw customError;

      const { data: generalMuscleGroups, error: generalError } = await supabase
        .from('exercise_datab_all_coaches')
        .select('muscle_group')
        .not('muscle_group', 'is', null);

      if (generalError) throw generalError;

      const allMuscleGroups = new Set(['All']);
      customMuscleGroups.forEach(item => {
        if (item.muscle_group) allMuscleGroups.add(item.muscle_group);
      });
      generalMuscleGroups.forEach(item => {
        if (item.muscle_group) allMuscleGroups.add(item.muscle_group);
      });

      setMuscleGroups(Array.from(allMuscleGroups));

    } catch (error) {
      console.error('Error fetching muscle groups:', error);
    }
  };

  useEffect(() => {
    fetchMuscleGroups();
  }, []);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No user found");
        return;
      }

      const customExercisesQuery = supabase
        .from('exercises')
        .select('*')
        .eq('coach_id', user.id);
      
      if (searchQuery) {
        customExercisesQuery.ilike('name', `%${searchQuery}%`);
      }

      const { data: customExercises, error: customError } = await customExercisesQuery;

      if (customError) {
        console.error("Error fetching custom exercises:", customError);
        throw customError;
      }

      const generalExercisesQuery = supabase
        .from('exercise_datab_all_coaches')
        .select('*');
      
      if (searchQuery) {
        generalExercisesQuery.ilike('name', `%${searchQuery}%`);
      }

      const { data: generalExercises, error: generalError } = await generalExercisesQuery;

      if (generalError) {
        console.error("Error fetching general exercises:", generalError);
        throw generalError;
      }

      const transformedCustomExercises = (customExercises || []).map(ex => ({
        ...ex,
        isCustom: true
      }));

      const transformedGeneralExercises = (generalExercises || []).map((ex: any) => {
        // Generate a deterministic UUID based on the exercise name
        const uuid = generateUUID(ex.name || 'unnamed_exercise');
        
        return {
          id: uuid,
          name: ex.name || '',
          description: ex.description || '',
          muscle_group: ex.muscle_group || '',
          start_position_image: ex.start_position_image || null,
          mid_position_image: ex.mid_posisiton_image || null,
          difficulty_level: ex.difficulty_level || 'Beginner',
          equipment_needed: ex.equitment_needed || null,
          instructions: ex.description || '',
          isCustom: false
        };
      });

      const allExercises = [...transformedCustomExercises, ...transformedGeneralExercises];
      console.log("All exercises after transformation:", allExercises);
      setAvailableExercises(allExercises);

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

      // Clean up exercise details before saving
      const exerciseDetailsForSaving = selectedExercises.map(({ isCustom, ...ex }) => ({
        id: ex.id,
        sets: ex.sets || 3,
        reps: ex.reps || 12,
        weight: ex.weight || 0,
        notes: ex.notes || '',
        name: ex.name
      }));

      console.log("Saving exercise details:", exerciseDetailsForSaving);

      const { error } = await supabase
        .from('training_plan_templates')
        .insert([
          {
            coach_id: user.id,
            name,
            description,
            exercises: selectedExercises.map(ex => ex.id),
            exercise_details: exerciseDetailsForSaving
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
      setSelectedExercises([...selectedExercises, { ...exercise, sets: 3, reps: 12 }]);
    }
  };

  const updateExerciseDetails = (exerciseId: string, field: keyof ExerciseWithDetails, value: number | string) => {
    setSelectedExercises(prev => prev.map(ex => {
      if (ex.id === exerciseId) {
        return { ...ex, [field]: value };
      }
      return ex;
    }));
  };

  const hasActiveFilters = muscleGroupFilter !== 'All' || searchQuery.trim() !== '';

  const filteredExercises = availableExercises.filter(exercise => {
    const matchesMuscleGroup = muscleGroupFilter === 'All' || 
      exercise.muscle_group?.toLowerCase() === muscleGroupFilter.toLowerCase();
    
    return matchesMuscleGroup;
  });

  useEffect(() => {
    fetchExercises();
  }, [searchQuery]);

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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Select value={muscleGroupFilter} onValueChange={setMuscleGroupFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by muscle" />
                  </SelectTrigger>
                  <SelectContent>
                    {muscleGroups.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  className="w-full sm:w-[280px]"
                  placeholder="Search exercises..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="border rounded-lg p-4">
                <ExerciseListView
                  exercises={filteredExercises}
                  onExerciseClick={handleExerciseClick}
                  selectedExerciseIds={selectedExercises.map(ex => ex.id)}
                  hasActiveFilters={hasActiveFilters}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Selected Exercises ({selectedExercises.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedExercises.length > 0 ? (
                <div className="space-y-4">
                  {selectedExercises.map((exercise) => (
                    <div key={exercise.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-medium">{exercise.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {exercise.isCustom ? 'Custom Exercise' : 'General Database'}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExerciseClick(exercise)}
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Sets</Label>
                          <Input
                            type="number"
                            min="1"
                            value={exercise.sets || ''}
                            onChange={(e) => updateExerciseDetails(exercise.id, 'sets', parseInt(e.target.value))}
                            placeholder="Number of sets"
                          />
                        </div>
                        <div>
                          <Label>Reps</Label>
                          <Input
                            type="number"
                            min="1"
                            value={exercise.reps || ''}
                            onChange={(e) => updateExerciseDetails(exercise.id, 'reps', parseInt(e.target.value))}
                            placeholder="Number of reps"
                          />
                        </div>
                        <div>
                          <Label>Weight (kg)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.5"
                            value={exercise.weight || ''}
                            onChange={(e) => updateExerciseDetails(exercise.id, 'weight', parseFloat(e.target.value))}
                            placeholder="Weight in kg"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Notes</Label>
                        <Textarea
                          value={exercise.notes || ''}
                          onChange={(e) => updateExerciseDetails(exercise.id, 'notes', e.target.value)}
                          placeholder="Add any notes about this exercise..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No exercises selected. Add some exercises from above.
                </p>
              )}
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
