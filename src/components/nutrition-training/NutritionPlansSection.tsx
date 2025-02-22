
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

type NutritionTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
};

export function NutritionPlansSection() {
  const navigate = useNavigate();
  const [nutritionPlans, setNutritionPlans] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchNutritionPlans = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First get the templates
      const { data: templates, error } = await supabase
        .from('nutrition_plan_templates')
        .select('*')
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // For each template, parse the meals JSON data
      const plansWithMeals = templates.map(template => ({
        ...template,
        meals: template.meals || []
      }));

      setNutritionPlans(plansWithMeals);
    } catch (error) {
      console.error('Error fetching nutrition plans:', error);
      toast({
        title: "Error",
        description: "Failed to load nutrition plans",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchNutritionPlans();
  }, []);

  const calculateTotalNutrition = (meals: any[]): NutritionTotals => {
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
    };

    meals?.forEach((meal) => {
      meal.ingredients?.forEach((ingredient: any) => {
        const quantity = ingredient.quantity || 0;
        const multiplier = quantity / 100;
        const nutrition = ingredient.nutrition || {};

        totals.calories += (nutrition.calories || 0) * multiplier;
        totals.protein += (nutrition.protein || 0) * multiplier;
        totals.carbs += (nutrition.carbs || 0) * multiplier;
        totals.fats += (nutrition.fats || 0) * multiplier;
        totals.fiber += (nutrition.fiber || 0) * multiplier;
      });
    });

    return totals;
  };

  const handleEditPlan = (planId: string) => {
    navigate(`/nutrition-and-training/create-nutrition-plan/${planId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Nutrition Plans</h2>
        <Button onClick={() => navigate("/nutrition-and-training/create-nutrition-plan")}>
          <Plus className="w-4 h-4 mr-2" />
          Create Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {nutritionPlans.map((plan) => {
          const totals = calculateTotalNutrition(plan.meals || []);
          
          return (
            <Card 
              key={plan.id} 
              className="cursor-pointer hover:bg-accent/5 transition-colors"
              onClick={() => handleEditPlan(plan.id)}
            >
              <CardHeader>
                <CardTitle>{plan.title}</CardTitle>
                <CardDescription>
                  Created on {new Date(plan.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {plan.description}
                </p>
                <Separator className="my-2" />
                <div className="grid grid-cols-3 gap-2 text-sm mt-2">
                  <div>
                    <p className="font-medium">{Math.round(totals.calories)}</p>
                    <p className="text-xs text-muted-foreground">Calories</p>
                  </div>
                  <div>
                    <p className="font-medium">{totals.protein.toFixed(1)}g</p>
                    <p className="text-xs text-muted-foreground">Protein</p>
                  </div>
                  <div>
                    <p className="font-medium">{totals.carbs.toFixed(1)}g</p>
                    <p className="text-xs text-muted-foreground">Carbs</p>
                  </div>
                  <div>
                    <p className="font-medium">{totals.fats.toFixed(1)}g</p>
                    <p className="text-xs text-muted-foreground">Fats</p>
                  </div>
                  <div>
                    <p className="font-medium">{totals.fiber.toFixed(1)}g</p>
                    <p className="text-xs text-muted-foreground">Fiber</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
