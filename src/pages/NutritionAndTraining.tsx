
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TrainingPlansSection } from "@/components/nutrition-training/TrainingPlansSection";
import { NutritionPlansSection } from "@/components/nutrition-training/NutritionPlansSection";
import { IngredientsSection } from "@/components/nutrition-training/IngredientsSection";

type Ingredient = {
  id: string;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
};

export default function NutritionAndTraining() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          return;
        }

        setUserRole(profile?.role);
      } catch (error) {
        console.error("Error in fetchUserRole:", error);
      }
    };

    fetchUserRole();
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('name');

      if (error) throw error;
      setIngredients(data);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    }
  };

  if (userRole !== 'coach') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-white/40 backdrop-blur-lg border border-red-100">
            <CardContent className="pt-6">
              <p className="text-center text-red-600">
                You don't have permission to access this page.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9f7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-[#1B4332] mb-6">Nutrition & Training Plans</h1>
        
        <Tabs defaultValue="training" className="space-y-6">
          <TabsList className="w-full flex justify-start space-x-8 border-b border-gray-200 bg-transparent p-0">
            <TabsTrigger 
              value="training"
              className="px-1 py-2 text-base font-medium text-gray-600 border-b-2 border-transparent data-[state=active]:border-[#27AE60] data-[state=active]:text-[#1B4332] rounded-none relative focus-visible:outline-none"
            >
              Training Plans
            </TabsTrigger>
            <TabsTrigger 
              value="nutrition"
              className="px-1 py-2 text-base font-medium text-gray-600 border-b-2 border-transparent data-[state=active]:border-[#27AE60] data-[state=active]:text-[#1B4332] rounded-none relative focus-visible:outline-none"
            >
              Nutrition Plans
            </TabsTrigger>
            <TabsTrigger 
              value="ingredients"
              className="px-1 py-2 text-base font-medium text-gray-600 border-b-2 border-transparent data-[state=active]:border-[#27AE60] data-[state=active]:text-[#1B4332] rounded-none relative focus-visible:outline-none"
            >
              Ingredients List
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
        </Tabs>
      </div>
    </div>
  );
}
