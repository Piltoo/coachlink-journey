
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MealManager } from '@/components/nutrition-training/create-plan/MealManager';
import { TotalNutrition } from '@/components/nutrition-training/create-plan/TotalNutrition';
import { useNutritionPlan } from '@/hooks/use-nutrition-plan';
import { calculateNutrition, calculateTotalNutrition } from '@/utils/nutrition-calculations';
import { supabase } from '@/integrations/supabase/client';
import { Ingredient } from '@/components/nutrition-training/types';

export default function CreateNutritionPlan() {
  const navigate = useNavigate();
  const {
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
  } = useNutritionPlan();

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
      calories_per_100g: ing.calories_per_100g,
      protein_per_100g: ing.protein_per_100g,
      carbs_per_100g: ing.carbs_per_100g,
      fats_per_100g: ing.fats_per_100g,
      fiber_per_100g: ing.fibers_per_100g,
    }));

    const combined = [...(coachIngredients || []), ...formattedAllIngredients];
    setSearchResults({ ...searchResults, [mealId]: combined });
  };

  const handleAddMeal = () => {
    const newMeal = {
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
              <CardTitle>Create Nutrition Plan</CardTitle>
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

          <MealManager
            meals={meals}
            searchTerms={searchTerms}
            searchResults={searchResults}
            quantities={quantities}
            isOptional={isOptional}
            onAddMeal={handleAddMeal}
            onMealNameChange={handleUpdateMealName}
            onSearchChange={searchIngredients}
            onQuantityChange={(mealId, quantity) => setQuantities({ ...quantities, [mealId]: quantity })}
            onOptionalChange={(mealId, optional) => setIsOptional({ ...isOptional, [mealId]: optional })}
            onIngredientSelect={handleAddIngredient}
            onItemQuantityChange={handleUpdateItemQuantity}
            onItemOptionalToggle={handleToggleItemOptional}
            onItemRemove={handleRemoveItem}
          />

          {meals.length > 0 && (
            <TotalNutrition totals={calculateTotalNutrition(meals)} />
          )}

          <Button type="submit" disabled={!title.trim() || meals.length === 0}>
            Create Nutrition Plan
          </Button>
        </form>
      </div>
    </div>
  );
}
