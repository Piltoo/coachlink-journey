
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrainingPlansSection } from "@/components/nutrition-training/TrainingPlansSection";
import { NutritionPlansSection } from "@/components/nutrition-training/NutritionPlansSection";
import { IngredientsSection } from "@/components/nutrition-training/IngredientsSection";
import { ExercisesSection } from "@/components/nutrition-training/ExercisesSection";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

type Ingredient = {
  id: string;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
  fiber_per_100g: number;
};

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

export default function NutritionAndTraining() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          console.error("Auth error:", authError);
          navigate('/auth');
          return;
        }

        // Get user profile and role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_role')
          .eq('id', user.id)
          .single();

        if (profileError || !profile) {
          console.error("Profile error:", profileError);
          navigate('/auth');
          return;
        }

        if (profile.user_role !== 'coach') {
          navigate('/dashboard');
          return;
        }

        // Fetch data for coaches
        const [ingredientsResponse, exercisesResponse] = await Promise.all([
          supabase.from('ingredients').select('*').order('name'),
          supabase.from('exercises').select('*').order('name')
        ]);

        if (ingredientsResponse.error) {
          throw new Error(`Ingredients error: ${ingredientsResponse.error.message}`);
        }

        if (exercisesResponse.error) {
          throw new Error(`Exercises error: ${exercisesResponse.error.message}`);
        }

        setIngredients(ingredientsResponse.data || []);
        setExercises(exercisesResponse.data || []);

      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        });
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [navigate, toast]);

  const handleIngredientAdded = async () => {
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .order('name');

    if (error) {
      toast({
        title: "Error",
        description: "Failed to refresh ingredients",
        variant: "destructive",
      });
      return;
    }

    setIngredients(data || []);
  };

  const handleExerciseChange = async () => {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name');

    if (error) {
      toast({
        title: "Error",
        description: "Failed to refresh exercises",
        variant: "destructive",
      });
      return;
    }

    setExercises(data || []);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Nutrition & Training Plans</h1>
        
        <Tabs defaultValue="training" className="space-y-6">
          <TabsList className="w-full flex border-b border-gray-200 bg-transparent p-0 space-x-8">
            <TabsTrigger 
              value="training"
              className="px-1 py-4 text-sm font-medium text-gray-500 border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:text-gray-900 rounded-none relative focus-visible:outline-none"
            >
              Training Plans
            </TabsTrigger>
            <TabsTrigger 
              value="nutrition"
              className="px-1 py-4 text-sm font-medium text-gray-500 border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:text-gray-900 rounded-none relative focus-visible:outline-none"
            >
              Nutrition Plans
            </TabsTrigger>
            <TabsTrigger 
              value="ingredients"
              className="px-1 py-4 text-sm font-medium text-gray-500 border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:text-gray-900 rounded-none relative focus-visible:outline-none"
            >
              Ingredients List
            </TabsTrigger>
            <TabsTrigger 
              value="exercises"
              className="px-1 py-4 text-sm font-medium text-gray-500 border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:text-gray-900 rounded-none relative focus-visible:outline-none"
            >
              Exercise Library
            </TabsTrigger>
          </TabsList>

          <TabsContent value="training" className="mt-6">
            <TrainingPlansSection />
          </TabsContent>

          <TabsContent value="nutrition" className="mt-6">
            <NutritionPlansSection />
          </TabsContent>

          <TabsContent value="ingredients" className="mt-6">
            <IngredientsSection 
              ingredients={ingredients} 
              onIngredientAdded={handleIngredientAdded}
            />
          </TabsContent>

          <TabsContent value="exercises" className="mt-6">
            <ExercisesSection 
              exercises={exercises}
              onExerciseChange={handleExerciseChange}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
