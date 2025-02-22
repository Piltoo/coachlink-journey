
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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        setLoading(true);
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error("Auth error:", authError);
          navigate('/auth');
          return;
        }

        if (!user) {
          console.log("No user found");
          navigate('/auth');
          return;
        }

        console.log("Current user ID:", user.id);

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_role, first_name')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          return;
        }

        if (!profile) {
          console.log("No profile found");
          return;
        }
        
        console.log("User role from profile:", profile.user_role);
        setUserRole(profile.user_role);

        if (profile.user_role === 'coach') {
          try {
            await Promise.all([fetchIngredients(), fetchExercises()]);
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        } else {
          console.log("User is not a coach");
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [navigate, toast]);

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
      setExercises(data || []);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!userRole) {
    return null;
  }

  if (userRole !== 'coach') {
    navigate('/dashboard');
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
