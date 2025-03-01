
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function MyTrainingPlans() {
  const [nutritionPlans, setNutritionPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMyNutritionPlans();
  }, []);

  const fetchMyNutritionPlans = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user found");
        return;
      }

      // Get client's nutrition plans
      const { data: clientPlans, error: clientError } = await supabase
        .from('client_nutrition_plans')
        .select(`
          id,
          assigned_at,
          status,
          nutrition_plan_id,
          nutrition_plans:nutrition_plan_id (
            id,
            title,
            description,
            created_at,
            meal_plan
          )
        `)
        .eq('client_id', user.id)
        .eq('status', 'active');

      if (clientError) throw clientError;

      // Get nutrition plan templates for plans assigned to client
      const planIds = clientPlans.map(cp => cp.nutrition_plan_id);
      if (planIds.length === 0) {
        setNutritionPlans([]);
        setIsLoading(false);
        return;
      }

      const { data: templates, error } = await supabase
        .from('nutrition_plan_templates')
        .select('*')
        .in('id', planIds);

      if (error) throw error;

      // Combine plans with their templates
      const plansWithDetails = clientPlans.map(clientPlan => {
        const template = templates.find(t => t.id === clientPlan.nutrition_plan_id);
        return {
          ...clientPlan,
          template: template || null
        };
      });

      setNutritionPlans(plansWithDetails);
    } catch (error) {
      console.error('Error fetching nutrition plans:', error);
      toast({
        title: "Error",
        description: "Failed to load your nutrition plans",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalNutrition = (meals: any[]) => {
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
    };

    meals?.forEach((meal) => {
      meal.items?.forEach((item: any) => {
        totals.calories += item.nutrition?.calories || 0;
        totals.protein += item.nutrition?.protein || 0;
        totals.carbs += item.nutrition?.carbs || 0;
        totals.fats += item.nutrition?.fats || 0;
        totals.fiber += item.nutrition?.fiber || 0;
      });
    });

    return totals;
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">My Nutrition Plans</h1>
        
        {isLoading ? (
          <div>Loading plans...</div>
        ) : nutritionPlans.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-muted-foreground">You don't have any nutrition plans assigned yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nutritionPlans.map((plan) => {
              const template = plan.template;
              if (!template) return null;
              
              const totals = calculateTotalNutrition(template.meals || []);
              
              return (
                <Card key={plan.id}>
                  <CardHeader>
                    <CardTitle>{template.title}</CardTitle>
                    <CardDescription>
                      Assigned on {new Date(plan.assigned_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{template.description}</p>
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

                    <Separator className="my-4" />

                    <div className="space-y-4">
                      <h3 className="font-medium">Meals</h3>
                      {template.meals?.map((meal: any, index: number) => (
                        <div key={meal.id || index} className="p-2 bg-accent/10 rounded-md">
                          <h4 className="font-medium">{meal.name}</h4>
                          <ul className="mt-2 space-y-1">
                            {meal.items?.map((item: any, itemIndex: number) => (
                              <li key={item.id || itemIndex} className="text-sm flex justify-between">
                                <span>{item.name}</span>
                                <span className="text-muted-foreground">{item.quantity}{item.unit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
