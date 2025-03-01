import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Utensils, ChevronRight, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { sv } from "date-fns/locale";

type NutritionPlan = {
  id: string;
  title: string;
  meals: Array<{
    id: string;
    name: string;
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      unit: string;
      optional: boolean;
      nutrition: {
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
        fiber: number;
      };
    }>;
  }>;
  assigned_at: string;
  status: "active" | "completed" | "archived";
};

export default function MyNutritionPlans() {
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<NutritionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNutritionPlans();
  }, []);

  const fetchNutritionPlans = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: clientPlans, error } = await supabase
        .from("client_nutrition_plans")
        .select(`
          id,
          assigned_at,
          status,
          nutrition_plan:nutrition_plan_id (
            id,
            title,
            meals
          )
        `)
        .eq("client_id", user.id)
        .order("assigned_at", { ascending: false });

      if (error) throw error;

      const formattedPlans = clientPlans.map(plan => ({
        id: plan.nutrition_plan.id,
        title: plan.nutrition_plan.title,
        meals: plan.nutrition_plan.meals,
        assigned_at: plan.assigned_at,
        status: plan.status
      }));

      setPlans(formattedPlans);
    } catch (error) {
      console.error("Error fetching nutrition plans:", error);
      toast({
        title: "Error",
        description: "Kunde inte hämta dina kostprogram",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalNutrition = (meals: NutritionPlan["meals"]) => {
    return meals.reduce((total, meal) => {
      const mealTotal = meal.items.reduce((mealSum, item) => ({
        calories: mealSum.calories + item.nutrition.calories,
        protein: mealSum.protein + item.nutrition.protein,
        carbs: mealSum.carbs + item.nutrition.carbs,
        fats: mealSum.fats + item.nutrition.fats,
        fiber: mealSum.fiber + item.nutrition.fiber,
      }), { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 });

      return {
        calories: total.calories + mealTotal.calories,
        protein: total.protein + mealTotal.protein,
        carbs: total.carbs + mealTotal.carbs,
        fats: total.fats + mealTotal.fats,
        fiber: total.fiber + mealTotal.fiber,
      };
    }, { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Laddar kostprogram...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Mina Kostprogram</CardTitle>
            <CardDescription>
              Här kommer du kunna se dina tilldelade kostprogram
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-green-100/20 flex items-center justify-center">
                <Utensils className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Inga kostprogram än</h3>
              <p className="text-muted-foreground max-w-sm">
                Du har inga tilldelade kostprogram just nu. Din coach kommer att tilldela dig ett när det är dags.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedPlan) {
    const totalNutrition = calculateTotalNutrition(selectedPlan.meals);

    return (
      <div className="container mx-auto py-6 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{selectedPlan.title}</CardTitle>
              <CardDescription>
                Tilldelad {format(new Date(selectedPlan.assigned_at), "d MMMM yyyy", { locale: sv })}
              </CardDescription>
            </div>
            <Button variant="ghost" onClick={() => setSelectedPlan(null)}>
              Tillbaka till översikt
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dagligt Näringsinnehåll</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Kalorier:</span>
                    <span className="font-medium">{Math.round(totalNutrition.calories)} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Protein:</span>
                    <span className="font-medium">{Math.round(totalNutrition.protein)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kolhydrater:</span>
                    <span className="font-medium">{Math.round(totalNutrition.carbs)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fett:</span>
                    <span className="font-medium">{Math.round(totalNutrition.fats)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fiber:</span>
                    <span className="font-medium">{Math.round(totalNutrition.fiber)}g</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <ScrollArea className="h-[500px] pr-4">
              {selectedPlan.meals.map((meal) => (
                <Card key={meal.id} className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-lg">{meal.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {meal.items.map((item) => (
                        <li key={item.id} className="flex justify-between items-center">
                          <span className="flex items-center gap-2">
                            {item.name}
                            {item.optional && (
                              <span className="text-xs text-muted-foreground">(Valfritt)</span>
                            )}
                          </span>
                          <span className="text-muted-foreground">
                            {item.quantity} {item.unit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mina Kostprogram</CardTitle>
          <CardDescription>
            Här kan du se dina tilldelade kostprogram
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {plans.map((plan) => (
              <Card key={plan.id} className="cursor-pointer hover:bg-accent/5" onClick={() => setSelectedPlan(plan)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{plan.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        {format(new Date(plan.assigned_at), "d MMMM yyyy", { locale: sv })}
                      </CardDescription>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}