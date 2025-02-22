import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MealCard } from '@/components/nutrition-training/create-plan/MealCard';
import { TotalNutrition } from '@/components/nutrition-training/create-plan/TotalNutrition';
import { Ingredient } from '@/components/nutrition-training/types';

type MealItem = {
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

type Meal = {
  id: string;
  name: string;
  items: MealItem[];
};

export default function CreateNutritionPlan() {
  const navigate = useNavigate();
  const { planId } = useParams();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [searchTerms, setSearchTerms] = useState<{ [key: string]: string }>({});
  const [searchResults, setSearchResults] = useState<{ [key: string]: Ingredient[] }>({});
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

  const parseNutritionValue = (value: string | number | null): number => {
    if (value === null || value === undefined) return 0;
    const parsed = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(parsed) ? 0 : parsed;
  };

  const calculateNutrition = (ingredient: Ingredient, grams: number) => {
    const multiplier = Math.max(0, grams) / 100;
    return {
      calories: parseNutritionValue(ingredient.calories_per_100g) * multiplier,
      protein: parseNutritionValue(ingredient.protein_per_100g) * multiplier,
      carbs: parseNutritionValue(ingredient.carbs_per_100g) * multiplier,
      fats: parseNutritionValue(ingredient.fats_per_100g) * multiplier,
      fiber: parseNutritionValue(ingredient.fiber_per_100g) * multiplier,
    };
  };

  const searchIngredients = async (mealId: string, term: string) => {
    setSearchTerms({ ...searchTerms, [mealId]: term });

    if (!term.trim()) {
      setSearchResults({ ...searchResults, [mealId]: [] });
      return;
    }

    const { data: coachIngredients, error: error1 } = await supabase
      .from('ingredients')
      .select('*')
      .ilike('name', `%${term}%`);

    const { data: allIngredients, error: error2 } = await supabase
      .from('ingredients_all_coaches')
      .select('*')
      .ilike('name', `%${term}%`);

    if (error1 || error2) {
      console.error('Error searching ingredients:', error1 || error2);
      return;
    }

    const formattedAllIngredients = (allIngredients || []).map(ing => ({
      id: `all_${ing.name}`,
      name: ing.name,
      calories_per_100g: parseNutritionValue(ing.calories_per_100g),
      protein_per_100g: parseNutritionValue(ing.protein_per_100g),
      carbs_per_100g: parseNutritionValue(ing.carbs_per_100g),
      fats_per_100g: parseNutritionValue(ing.fats_per_100g),
      fiber_per_100g: parseNutritionValue(ing.fibers_per_100g),
    }));

    const combined = [...(coachIngredients || []), ...formattedAllIngredients];
    setSearchResults({ ...searchResults, [mealId]: combined });
  };

  const handleAddMeal = () => {
    const newMeal: Meal = {
      id: Math.random().toString(),
      name: `Meal ${meals.length + 1}`,
      items: []
    };
    setMeals([...meals, newMeal]);
  };

  const handleUpdateMealName = (mealId: string, newName: string) => {
    setMeals(meals.map(meal => 
      meal.id === mealId ? { ...meal, name: newName } : meal
    ));
  };

  const handleAddIngredient = (mealId: string, ingredient: Ingredient) => {
    const quantity = quantities[mealId] || 100;
    const optional = isOptional[mealId] || false;
    const nutrition = calculateNutrition(ingredient, quantity);
    
    setMeals(meals.map(meal => {
      if (meal.id === mealId) {
        return {
          ...meal,
          items: [...meal.items, {
            id: Math.random().toString(),
            name: ingredient.name,
            quantity,
            unit: 'g',
            optional,
            nutrition,
          }]
        };
      }
      return meal;
    }));

    setSearchTerms({ ...searchTerms, [mealId]: '' });
    setSearchResults({ ...searchResults, [mealId]: [] });
    setQuantities({ ...quantities, [mealId]: 100 });
    setIsOptional({ ...isOptional, [mealId]: false });
  };

  const handleUpdateItemQuantity = (mealId: string, itemId: string, newQuantity: number) => {
    if (isNaN(newQuantity) || newQuantity < 0) {
      newQuantity = 0;
    }

    setMeals(meals.map(meal => {
      if (meal.id === mealId) {
        return {
          ...meal,
          items: meal.items.map(item => {
            if (item.id === itemId) {
              const currentNutrition = item.nutrition;
              const per100g = {
                calories: (currentNutrition.calories * 100) / item.quantity,
                protein: (currentNutrition.protein * 100) / item.quantity,
                carbs: (currentNutrition.carbs * 100) / item.quantity,
                fats: (currentNutrition.fats * 100) / item.quantity,
                fiber: (currentNutrition.fiber * 100) / item.quantity,
              };
              
              const multiplier = newQuantity / 100;
              return {
                ...item,
                quantity: newQuantity,
                nutrition: {
                  calories: per100g.calories * multiplier,
                  protein: per100g.protein * multiplier,
                  carbs: per100g.carbs * multiplier,
                  fats: per100g.fats * multiplier,
                  fiber: per100g.fiber * multiplier,
                },
              };
            }
            return item;
          })
        };
      }
      return meal;
    }));
  };

  const handleToggleItemOptional = (mealId: string, itemId: string) => {
    setMeals(meals.map(meal => {
      if (meal.id === mealId) {
        return {
          ...meal,
          items: meal.items.map(item => {
            if (item.id === itemId) {
              return { ...item, optional: !item.optional };
            }
            return item;
          })
        };
      }
      return meal;
    }));
  };

  const handleRemoveItem = (mealId: string, itemId: string) => {
    setMeals(meals.map(meal => {
      if (meal.id === mealId) {
        return {
          ...meal,
          items: meal.items.filter(item => item.id !== itemId)
        };
      }
      return meal;
    }));
  };

  const calculateTotalNutrition = () => {
    return meals.reduce((total, meal) => {
      const mealTotal = meal.items
        .filter(item => !item.optional)
        .reduce((mealSum, item) => ({
          calories: mealSum.calories + (item.nutrition?.calories || 0),
          protein: mealSum.protein + (item.nutrition?.protein || 0),
          carbs: mealSum.carbs + (item.nutrition?.carbs || 0),
          fats: mealSum.fats + (item.nutrition?.fats || 0),
          fiber: mealSum.fiber + (item.nutrition?.fiber || 0),
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
          nutrition: {
            calories: item.nutrition.calories,
            protein: item.nutrition.protein,
            carbs: item.nutrition.carbs,
            fats: item.nutrition.fats,
            fiber: item.nutrition.fiber,
          }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => navigate('/nutrition-and-training')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Nutrition Plans
        </Button>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>{planId ? 'Edit' : 'Create'} Nutrition Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Plan Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter plan title"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-medium">Meals</h2>
              <Button 
                type="button"
                onClick={handleAddMeal}
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Meal
              </Button>
            </div>

            {meals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                searchTerm={searchTerms[meal.id] || ''}
                searchResults={searchResults[meal.id] || []}
                quantity={quantities[meal.id] || 100}
                isOptional={isOptional[meal.id] || false}
                onMealNameChange={(name) => handleUpdateMealName(meal.id, name)}
                onSearchChange={(term) => searchIngredients(meal.id, term)}
                onQuantityChange={(quantity) => setQuantities({ ...quantities, [meal.id]: quantity })}
                onOptionalChange={(optional) => setIsOptional({ ...isOptional, [meal.id]: optional })}
                onIngredientSelect={(ingredient) => handleAddIngredient(meal.id, ingredient)}
                onItemQuantityChange={(itemId, quantity) => handleUpdateItemQuantity(meal.id, itemId, quantity)}
                onItemOptionalToggle={(itemId) => handleToggleItemOptional(meal.id, itemId)}
                onItemRemove={(itemId) => handleRemoveItem(meal.id, itemId)}
              />
            ))}
          </div>

          {meals.length > 0 && (
            <TotalNutrition totals={calculateTotalNutrition()} />
          )}

          <Button type="submit" disabled={!title.trim() || meals.length === 0}>
            {planId ? 'Update' : 'Create'} Nutrition Plan
          </Button>
        </form>
      </div>
    </div>
  );
}
