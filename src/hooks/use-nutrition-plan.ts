
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export type MealItem = {
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
};

export type Meal = {
  id: string;
  name: string;
  items: MealItem[];
};

export const useNutritionPlan = () => {
  const navigate = useNavigate();
  const { planId } = useParams();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [searchTerms, setSearchTerms] = useState<{ [key: string]: string }>({});
  const [searchResults, setSearchResults] = useState<{ [key: string]: any[] }>({});
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [isOptional, setIsOptional] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (planId) {
      loadExistingPlan();
    }
  }, [planId]);

  const loadExistingPlan = async () => {
    setIsLoading(true);
    try {
      const { data: plan, error } = await supabase
        .from('nutrition_plan_templates')
        .select('*')
        .eq('id', planId)
        .single();

      if (error) throw error;

      if (plan) {
        setTitle(plan.title);
        if (plan.meals && Array.isArray(plan.meals)) {
          const loadedMeals: Meal[] = (plan.meals as any[]).map((meal) => ({
            id: meal.id || Math.random().toString(),
            name: meal.name,
            items: meal.items.map((item: any) => ({
              id: item.id || Math.random().toString(),
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              optional: item.optional,
              nutrition: {
                calories: parseFloat(item.nutrition.calories) || 0,
                protein: parseFloat(item.nutrition.protein) || 0,
                carbs: parseFloat(item.nutrition.carbs) || 0,
                fats: parseFloat(item.nutrition.fats) || 0,
                fiber: parseFloat(item.nutrition.fiber) || 0,
              }
            }))
          }));
          setMeals(loadedMeals);
        }
      }
    } catch (error) {
      console.error('Error loading nutrition plan:', error);
      toast({
        title: "Error",
        description: "Failed to load nutrition plan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a plan title",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create a nutrition plan",
          variant: "destructive",
        });
        return;
      }

      const mealsData = meals.map(meal => ({
        id: meal.id,
        name: meal.name,
        items: meal.items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          optional: item.optional,
          nutrition: item.nutrition
        }))
      }));

      const planData = {
        title,
        coach_id: user.id,
        meals: mealsData,
        updated_at: new Date().toISOString(),
      };

      let error;
      if (planId) {
        const { error: updateError } = await supabase
          .from('nutrition_plan_templates')
          .update(planData)
          .eq('id', planId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('nutrition_plan_templates')
          .insert([planData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Nutrition plan ${planId ? 'updated' : 'created'} successfully`,
      });

      navigate('/nutrition-and-training');
    } catch (error) {
      console.error('Error saving nutrition plan:', error);
      toast({
        title: "Error",
        description: "Failed to save nutrition plan",
        variant: "destructive",
      });
    }
  };

  return {
    title,
    setTitle,
    meals,
    setMeals,
    searchTerms,
    setSearchTerms,
    searchResults,
    setSearchResults,
    quantities,
    setQuantities,
    isOptional,
    setIsOptional,
    isLoading,
    handleSubmit,
  };
};
