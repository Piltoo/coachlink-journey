import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Meal } from '@/hooks/use-nutrition-plan';
import { NutritionPlanDetails } from '@/components/nutrition-training/client/NutritionPlanDetails';
import { calculateTotalNutrition } from '@/utils/nutrition-calculations';
import { format } from 'date-fns';

type NutritionPlan = {
  id: string;
  title: string;
  meals: Meal[];
  assigned_at: string;
  status: string;
};

export default function MyNutritionPlans() {
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNutritionPlans();
  }, []);

  const fetchNutritionPlans = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('client_nutrition_plans')
        .select(`
          id,
          status,
          assigned_at,
          nutrition_plan_id,
          nutrition_plans:nutrition_plan_id (
            id,
            title,
            meals
          )
        `)
        .eq('client_id', user.id)
        .eq('status', 'active');

      if (error) throw error;

      if (data && data.length > 0) {
        // Convert the data to the right format
        const plans = data.map(item => {
          let mealsArray: Meal[] = [];
          
          // Parse meals JSON if it exists
          if (item.nutrition_plans?.meals) {
            const mealsData = typeof item.nutrition_plans.meals === 'string'
              ? JSON.parse(item.nutrition_plans.meals)
              : item.nutrition_plans.meals;
              
            if (Array.isArray(mealsData)) {
              mealsArray = mealsData.map((meal: any) => ({
                id: meal.id || String(Math.random()),
                name: meal.name || '',
                items: Array.isArray(meal.items) ? meal.items.map((item: any) => ({
                  id: item.id || String(Math.random()),
                  name: item.name || '',
                  quantity: Number(item.quantity) || 0,
                  unit: item.unit || 'g',
                  optional: Boolean(item.optional) || false,
                  nutrition: {
                    calories: Number(item.nutrition?.calories) || 0,
                    protein: Number(item.nutrition?.protein) || 0,
                    carbs: Number(item.nutrition?.carbs) || 0,
                    fats: Number(item.nutrition?.fats) || 0,
                    fiber: Number(item.nutrition?.fiber) || 0,
                  }
                })) : []
              }));
            }
          }
          
          return {
            id: item.id,
            title: item.nutrition_plans?.title || 'Untitled Plan',
            meals: mealsArray,
            assigned_at: item.assigned_at,
            status: item.status
          };
        });
        
        setNutritionPlans(plans);
      }
    } catch (error) {
      console.error('Error fetching nutrition plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to load nutrition plans',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center h-64">
          <p>Loading nutrition plans...</p>
        </div>
      </div>
    );
  }

  if (nutritionPlans.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>My Nutrition Plans</CardTitle>
            <CardDescription>
              You don't have any nutrition plans assigned yet.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Tabs defaultValue="current" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Nutrition Plans</h1>
          <TabsList>
            <TabsTrigger value="current">Current Plan</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="current">
          {nutritionPlans.map((plan) => (
            <Card key={plan.id} className="mb-6">
              <CardHeader>
                <CardTitle>{plan.title}</CardTitle>
                <CardDescription>
                  Assigned on {format(new Date(plan.assigned_at), 'MMMM d, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NutritionPlanDetails 
                  meals={plan.meals} 
                  totalNutrition={calculateTotalNutrition(plan.meals)} 
                />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Nutrition Plan History</CardTitle>
              <CardDescription>
                View your previous nutrition plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>No previous plans found.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
