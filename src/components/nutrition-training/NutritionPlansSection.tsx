
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type Template = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  meals: Array<{
    name: string;
    ingredients: Array<{
      ingredient: {
        calories_per_100g: number;
        protein_per_100g: number;
        carbs_per_100g: number;
        fats_per_100g: number;
        fiber_per_100g: number;
      };
      quantity_grams: number;
    }>;
  }>;
};

export function NutritionPlansSection() {
  const navigate = useNavigate();

  const { data: templates = [] } = useQuery({
    queryKey: ["nutrition_plan_templates"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('nutrition_plan_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process the templates to calculate totals
      return (data || []).map(template => {
        // Safely cast the meals data to our expected type
        const meals = (template.meals as any[] || []).map(meal => ({
          name: meal.name || '',
          ingredients: (meal.ingredients || []).map((ing: any) => ({
            ingredient: {
              calories_per_100g: Number(ing.ingredient.calories_per_100g) || 0,
              protein_per_100g: Number(ing.ingredient.protein_per_100g) || 0,
              carbs_per_100g: Number(ing.ingredient.carbs_per_100g) || 0,
              fats_per_100g: Number(ing.ingredient.fats_per_100g) || 0,
              fiber_per_100g: Number(ing.ingredient.fiber_per_100g) || 0
            },
            quantity_grams: Number(ing.quantity_grams) || 0
          }))
        }));

        const totalNutrition = meals.reduce((acc, meal) => {
          const mealNutrition = meal.ingredients.reduce((mealAcc, { ingredient, quantity_grams }) => {
            const multiplier = quantity_grams / 100;
            return {
              calories: mealAcc.calories + (ingredient.calories_per_100g * multiplier),
              protein: mealAcc.protein + (ingredient.protein_per_100g * multiplier),
              carbs: mealAcc.carbs + (ingredient.carbs_per_100g * multiplier),
              fats: mealAcc.fats + (ingredient.fats_per_100g * multiplier),
              fiber: mealAcc.fiber + (ingredient.fiber_per_100g * multiplier)
            };
          }, { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 });

          return {
            calories: acc.calories + mealNutrition.calories,
            protein: acc.protein + mealNutrition.protein,
            carbs: acc.carbs + mealNutrition.carbs,
            fats: acc.fats + mealNutrition.fats,
            fiber: acc.fiber + mealNutrition.fiber
          };
        }, { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 });

        return {
          id: template.id,
          title: template.title,
          description: template.description,
          created_at: template.created_at,
          meals,
          totalNutrition
        };
      });
    }
  });

  return (
    <div className="bg-white/40 backdrop-blur-lg rounded-lg border border-gray-200/50 p-6 shadow-sm transition-all duration-200 ease-in-out">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Nutrition Plans</h2>
        <Button 
          onClick={() => navigate("/nutrition-training/create")}
          className="bg-[#a7cca4] hover:bg-[#96bb93] text-white font-medium"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card 
            key={template.id} 
            className="cursor-pointer hover:bg-accent/5 transition-colors"
            onClick={() => navigate(`/nutrition-training/create?template=${template.id}`)}
          >
            <CardHeader>
              <CardTitle>{template.title}</CardTitle>
              <CardDescription>
                Created on {new Date(template.created_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {template.description || "No description provided"}
              </p>
              <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                <p>Total Calories: {template.totalNutrition.calories.toFixed(0)} kcal</p>
                <p>Protein: {template.totalNutrition.protein.toFixed(1)}g</p>
                <p>Carbs: {template.totalNutrition.carbs.toFixed(1)}g</p>
                <p>Fats: {template.totalNutrition.fats.toFixed(1)}g</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/nutrition-training/create?template=${template.id}`);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No nutrition plans created yet.
        </div>
      )}
    </div>
  );
}
