
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
  const [userRole, setUserRole] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('user_role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          return;
        }

        if (!profile || profile.user_role !== 'coach') {
          navigate('/dashboard');
          return;
        }

        setUserRole(profile.user_role);
        await Promise.all([fetchIngredients(), fetchExercises()]);
      } catch (error) {
        console.error("Error in fetchUserRole:", error);
      }
    };

    fetchUserRole();
  }, [navigate]);

  const fetchIngredients = async () => {
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('name');

      if (error) {
        toast({
          title: "Error fetching ingredients",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      setIngredients(data || []);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    }
  };

  const fetchExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');

      if (error) throw error;
      setExercises(data);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    }
  };

  if (userRole !== 'coach') {
    return null;
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
              onIngredientAdded={fetchIngredients}
            />
          </TabsContent>

          <TabsContent value="exercises" className="mt-6">
            <ExercisesSection 
              exercises={exercises}
              onExerciseChange={fetchExercises}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
