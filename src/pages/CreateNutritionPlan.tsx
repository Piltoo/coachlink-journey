import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Ingredient = {
  id: string;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
  fiber_per_100g: number;
};

type MealItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
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
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [searchTerms, setSearchTerms] = useState<{ [key: string]: string }>({});
  const [searchResults, setSearchResults] = useState<{ [key: string]: Ingredient[] }>({});
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  const calculateNutrition = (ingredient: Ingredient, grams: number) => {
    const multiplier = grams / 100;
    return {
      calories: ingredient.calories_per_100g * multiplier,
      protein: ingredient.protein_per_100g * multiplier,
      carbs: ingredient.carbs_per_100g * multiplier,
      fats: ingredient.fats_per_100g * multiplier,
      fiber: ingredient.fiber_per_100g * multiplier,
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
      calories_per_100g: Number(ing.calories_per_100g) || 0,
      protein_per_100g: Number(ing.protein_per_100g) || 0,
      carbs_per_100g: Number(ing.carbs_per_100g) || 0,
      fats_per_100g: Number(ing.fats_per_100g) || 0,
      fiber_per_100g: Number(ing.fibers_per_100g) || 0,
    }));

    const combined = [...(coachIngredients || []), ...formattedAllIngredients];
    setSearchResults({ ...searchResults, [mealId]: combined });
  };

  const addIngredientToMeal = (mealId: string, ingredient: Ingredient) => {
    const quantity = quantities[mealId] || 100;
    const nutrition = calculateNutrition(ingredient, quantity);
    
    setMeals(meals.map(meal => {
      if (meal.id === mealId) {
        return {
          ...meal,
          items: [...meal.items, {
            id: Math.random().toString(),
            name: ingredient.name,
            quantity: quantity,
            unit: 'g',
            nutrition,
          }]
        };
      }
      return meal;
    }));

    setSearchTerms({ ...searchTerms, [mealId]: '' });
    setSearchResults({ ...searchResults, [mealId]: [] });
    setQuantities({ ...quantities, [mealId]: 100 });
  };

  const calculateTotalNutrition = () => {
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

      const { error } = await supabase
        .from('nutrition_plan_templates')
        .insert([
          {
            title,
            coach_id: user.id,
            meals: meals,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Nutrition plan created successfully",
      });

      navigate('/nutrition-and-training');
    } catch (error) {
      console.error('Error creating nutrition plan:', error);
      toast({
        title: "Error",
        description: "Failed to create nutrition plan",
        variant: "destructive",
      });
    }
  };

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
              <CardTitle>Create New Nutrition Plan</CardTitle>
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
              <Card key={meal.id} className="bg-card">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <Input
                      value={meal.name}
                      onChange={(e) => handleUpdateMealName(meal.id, e.target.value)}
                      placeholder="Meal name"
                      className="font-medium"
                    />
                    
                    {meal.items.map((item) => (
                      <div key={item.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{item.name}</span>
                          <span>{item.quantity}g</span>
                        </div>
                        <div className="text-sm text-muted-foreground grid grid-cols-5 gap-2">
                          <div>Calories: {item.nutrition.calories.toFixed(1)}</div>
                          <div>Protein: {item.nutrition.protein.toFixed(1)}g</div>
                          <div>Carbs: {item.nutrition.carbs.toFixed(1)}g</div>
                          <div>Fats: {item.nutrition.fats.toFixed(1)}g</div>
                          <div>Fiber: {item.nutrition.fiber.toFixed(1)}g</div>
                        </div>
                      </div>
                    ))}

                    <div className="space-y-4 border rounded-lg p-4">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <Label htmlFor={`search-${meal.id}`}>Search Ingredients</Label>
                          <div className="relative">
                            <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id={`search-${meal.id}`}
                              value={searchTerms[meal.id] || ''}
                              onChange={(e) => searchIngredients(meal.id, e.target.value)}
                              className="pl-8"
                              placeholder="Search ingredients..."
                            />
                          </div>
                        </div>
                        <div className="w-24">
                          <Label htmlFor={`quantity-${meal.id}`}>Grams</Label>
                          <Input
                            id={`quantity-${meal.id}`}
                            type="number"
                            value={quantities[meal.id] || 100}
                            onChange={(e) => setQuantities({
                              ...quantities,
                              [meal.id]: Number(e.target.value)
                            })}
                            min="0"
                          />
                        </div>
                      </div>
                      
                      {(searchResults[meal.id] || []).length > 0 && (
                        <div className="max-h-[200px] overflow-y-auto space-y-2">
                          {searchResults[meal.id].map((ingredient) => (
                            <Button
                              key={ingredient.id}
                              type="button"
                              variant="outline"
                              className="w-full justify-between"
                              onClick={() => addIngredientToMeal(meal.id, ingredient)}
                            >
                              <span>{ingredient.name}</span>
                              <span>{ingredient.calories_per_100g} cal/100g</span>
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {meals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Total Nutrition</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4 text-center">
                  <div>
                    <div className="text-lg font-medium">
                      {calculateTotalNutrition().calories.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Calories</div>
                  </div>
                  <div>
                    <div className="text-lg font-medium">
                      {calculateTotalNutrition().protein.toFixed(1)}g
                    </div>
                    <div className="text-sm text-muted-foreground">Protein</div>
                  </div>
                  <div>
                    <div className="text-lg font-medium">
                      {calculateTotalNutrition().carbs.toFixed(1)}g
                    </div>
                    <div className="text-sm text-muted-foreground">Carbs</div>
                  </div>
                  <div>
                    <div className="text-lg font-medium">
                      {calculateTotalNutrition().fats.toFixed(1)}g
                    </div>
                    <div className="text-sm text-muted-foreground">Fats</div>
                  </div>
                  <div>
                    <div className="text-lg font-medium">
                      {calculateTotalNutrition().fiber.toFixed(1)}g
                    </div>
                    <div className="text-sm text-muted-foreground">Fiber</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Button type="submit" disabled={!title.trim() || meals.length === 0}>
            Create Nutrition Plan
          </Button>
        </form>
      </div>
    </div>
  );
}
