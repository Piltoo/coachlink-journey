
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MaterialSymbol } from "@/components/ui/material-symbol";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { X, Plus, Trash2 } from "lucide-react";
import type { PartialMeal, Ingredient, MealNutrition } from "@/components/nutrition-training/types";

export default function CreateNutritionPlan() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [meals, setMeals] = useState<PartialMeal[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [currentMealIndex, setCurrentMealIndex] = useState<number | null>(null);

  const { data: ingredients = [] } = useQuery({
    queryKey: ["ingredients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ingredients")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Ingredient[];
    },
  });

  const { data: allCoachesIngredients = [] } = useQuery({
    queryKey: ["ingredients_all_coaches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ingredients_all_coaches")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Ingredient[];
    },
  });

  const addNewMeal = () => {
    setMeals([
      ...meals,
      {
        name: `Meal ${meals.length + 1}`,
        ingredients: [],
      },
    ]);
  };

  const updateMealName = (index: number, name: string) => {
    const updatedMeals = [...meals];
    updatedMeals[index].name = name;
    setMeals(updatedMeals);
  };

  const addIngredientToMeal = (mealIndex: number) => {
    if (!selectedIngredient || !quantity) return;

    const ingredient = [...ingredients, ...allCoachesIngredients].find(
      (i) => i.id === selectedIngredient
    );
    if (!ingredient) return;

    const updatedMeals = [...meals];
    updatedMeals[mealIndex].ingredients.push({
      ingredient_id: ingredient.id,
      ingredient,
      quantity_grams: parseFloat(quantity),
    });
    setMeals(updatedMeals);
    setSelectedIngredient("");
    setQuantity("");
    setCurrentMealIndex(null);
  };

  const removeIngredient = (mealIndex: number, ingredientIndex: number) => {
    const updatedMeals = [...meals];
    updatedMeals[mealIndex].ingredients.splice(ingredientIndex, 1);
    setMeals(updatedMeals);
  };

  const calculateMealNutrition = (mealIndex: number): MealNutrition => {
    return meals[mealIndex].ingredients.reduce(
      (acc, { ingredient, quantity_grams }) => ({
        calories: acc.calories + (ingredient.calories_per_100g * quantity_grams) / 100,
        protein: acc.protein + (ingredient.protein_per_100g * quantity_grams) / 100,
        carbs: acc.carbs + (ingredient.carbs_per_100g * quantity_grams) / 100,
        fats: acc.fats + (ingredient.fats_per_100g * quantity_grams) / 100,
        fiber: acc.fiber + (ingredient.fiber_per_100g * quantity_grams) / 100,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }
    );
  };

  const calculateTotalNutrition = (): MealNutrition => {
    return meals.reduce(
      (acc, _, index) => {
        const mealNutrition = calculateMealNutrition(index);
        return {
          calories: acc.calories + mealNutrition.calories,
          protein: acc.protein + mealNutrition.protein,
          carbs: acc.carbs + mealNutrition.carbs,
          fats: acc.fats + mealNutrition.fats,
          fiber: acc.fiber + mealNutrition.fiber,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }
    );
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/nutrition-training")}
              className="hover:bg-gray-100"
            >
              <MaterialSymbol icon="arrow_back" />
            </Button>
            <h1 className="text-2xl font-semibold">Create Nutrition Plan Template</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/nutrition-training")}
            className="hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Plan Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter plan title"
                  className="max-w-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter plan description"
                  className="max-w-lg h-32"
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {meals.map((meal, mealIndex) => (
              <Card key={mealIndex}>
                <CardHeader className="p-6">
                  <div className="flex items-center justify-between">
                    <Input
                      value={meal.name}
                      onChange={(e) => updateMealName(mealIndex, e.target.value)}
                      className="max-w-xs"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentMealIndex(mealIndex)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Ingredient
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {currentMealIndex === mealIndex && (
                    <div className="flex gap-4 mb-4">
                      <Select
                        value={selectedIngredient}
                        onValueChange={setSelectedIngredient}
                      >
                        <SelectTrigger className="w-[300px]">
                          <SelectValue placeholder="Select an ingredient" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {[...ingredients, ...allCoachesIngredients].map((ingredient) => (
                              <SelectItem key={ingredient.id} value={ingredient.id}>
                                {ingredient.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder="Grams"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-32"
                      />
                      <Button onClick={() => addIngredientToMeal(mealIndex)}>
                        Add
                      </Button>
                    </div>
                  )}

                  <div className="space-y-4">
                    {meal.ingredients.map((mealIngredient, ingredientIndex) => (
                      <div
                        key={ingredientIndex}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{mealIngredient.ingredient.name}</p>
                          <p className="text-sm text-gray-500">
                            {mealIngredient.quantity_grams}g
                          </p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-sm text-gray-600 space-x-4">
                            <span>{((mealIngredient.ingredient.calories_per_100g * mealIngredient.quantity_grams) / 100).toFixed(1)} cal</span>
                            <span>{((mealIngredient.ingredient.protein_per_100g * mealIngredient.quantity_grams) / 100).toFixed(1)}g protein</span>
                            <span>{((mealIngredient.ingredient.carbs_per_100g * mealIngredient.quantity_grams) / 100).toFixed(1)}g carbs</span>
                            <span>{((mealIngredient.ingredient.fats_per_100g * mealIngredient.quantity_grams) / 100).toFixed(1)}g fats</span>
                            <span>{((mealIngredient.ingredient.fiber_per_100g * mealIngredient.quantity_grams) / 100).toFixed(1)}g fiber</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeIngredient(mealIndex, ingredientIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {meal.ingredients.length > 0 && (
                      <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                        <p className="font-semibold">Meal Total:</p>
                        <div className="text-sm text-gray-600 space-x-4">
                          {Object.entries(calculateMealNutrition(mealIndex)).map(([key, value]) => (
                            <span key={key}>{value.toFixed(1)}{key === 'calories' ? ' cal' : 'g'} {key !== 'calories' ? key : ''}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {meals.length > 0 && (
            <Card>
              <CardHeader className="p-6">
                <CardTitle>Total Nutrition Values</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-lg font-medium space-x-6">
                  {Object.entries(calculateTotalNutrition()).map(([key, value]) => (
                    <span key={key}>{value.toFixed(1)}{key === 'calories' ? ' cal' : 'g'} {key !== 'calories' ? key : ''}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Button onClick={addNewMeal} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add New Meal
          </Button>
        </div>
      </div>
    </div>
  );
}
