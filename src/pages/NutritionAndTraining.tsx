
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NavigationTabs } from "@/components/nutrition-training/NavigationTabs";
import { AccessCheck } from "@/components/nutrition-training/AccessCheck";
import { Exercise, Ingredient } from "@/components/nutrition-training/types/nutrition-training";

export default function NutritionAndTraining() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchIngredients();
    fetchExercises();
  }, []);

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

  return (
    <AccessCheck>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-8">
            Nutrition & Training Plans
          </h1>
          
          <NavigationTabs
            ingredients={ingredients}
            exercises={exercises}
            onIngredientAdded={fetchIngredients}
            onExerciseChange={fetchExercises}
          />
        </div>
      </div>
    </AccessCheck>
  );
}
