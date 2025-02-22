import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MaterialSymbol } from "@/components/ui/material-symbol";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { X, Plus, Trash2, Search } from "lucide-react";
import type { PartialMeal, Ingredient, MealNutrition } from "@/components/nutrition-training/types";
import { useState as useDebounceState } from "react";

export default function CreateNutritionPlan() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [meals, setMeals] = useState<PartialMeal[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [currentMealIndex, setCurrentMealIndex] = useState<number | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const { data: searchResults = [] } = useQuery({
    queryKey: ["ingredients_search", searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];

      // Search in personal ingredients
      const { data: personalData, error: personalError } = await supabase
        .from("ingredients")
        .select("*")
        .ilike("name", `%${searchQuery}%`)
        .limit(50);

      if (personalError) throw personalError;

      // Search in all_coaches ingredients
      const { data: sharedData, error: sharedError } = await supabase
        .from("ingredients_all_coaches")
        .select("*")
        .ilike("name", `%${searchQuery}%`)
        .limit(50);

      if (sharedError) throw sharedError;

      // Transform shared ingredients data with proper number conversion
      const transformedSharedData = (sharedData || []).map((item: any) => ({
        id: `shared_${item.name.toLowerCase().replace(/\s+/g, '_')}`,
        name: item.name,
        calories_per_100g: Number(item.calories_per_100g) || 0,
        protein_per_100g: Number(item.protein_per_100g) || 0,
        carbs_per_100g: Number(item.carbs_per_100g) || 0,
        fats_per_100g: Number(item.fats_per_100g) || 0,
        fiber_per_100g: Number(item.fibers_per_100g) || 0,
        group_name: item.grop || null
      }));

      // Ensure personal data values are numbers
      const transformedPersonalData = (personalData || []).map(item => ({
        ...item,
        calories_per_100g: Number(item.calories_per_100g) || 0,
        protein_per_100g: Number(item.protein_per_100g) || 0,
        carbs_per_100g: Number(item.carbs_per_100g) || 0,
        fats_per_100g: Number(item.fats_per_100g) || 0,
        fiber_per_100g: Number(item.fiber_per_100g) || 0,
      }));

      return [...transformedPersonalData, ...transformedSharedData] as Ingredient[];
    },
    enabled: searchQuery.length > 0,
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

    const ingredient = searchResults.find(
      (i) => i.id === selectedIngredient
    );
    if (!ingredient) return;

    console.log('Adding ingredient with nutrition values:', {
      name: ingredient.name,
      calories: ingredient.calories_per_100g,
      protein: ingredient.protein_per_100g,
      carbs: ingredient.carbs_per_100g,
      fats: ingredient.fats_per_100g,
      fiber: ingredient.fiber_per_100g
    });

    const updatedMeals = [...meals];
    updatedMeals[mealIndex].ingredients.push({
      ingredient_id: ingredient.id,
      ingredient: {
        ...ingredient,
        calories_per_100g: Number(ingredient.calories_per_100g),
        protein_per_100g: Number(ingredient.protein_per_100g),
        carbs_per_100g: Number(ingredient.carbs_per_100g),
        fats_per_100g: Number(ingredient.fats_per_100g),
        fiber_per_100g: Number(ingredient.fiber_per_100g),
      },
      quantity_grams: parseFloat(quantity),
    });
    setMeals(updatedMeals);
    setSelectedIngredient("");
    setQuantity("");
    setSearchOpen(false);
    setSearchQuery("");
  };

  const removeIngredient = (mealIndex: number, ingredientIndex: number) => {
    const updatedMeals = [...meals];
    updatedMeals[mealIndex].ingredients.splice(ingredientIndex, 1);
    setMeals(updatedMeals);
  };

  const calculateMealNutrition = (mealIndex: number): MealNutrition => {
    const mealNutrition = meals[mealIndex].ingredients.reduce(
      (acc, { ingredient, quantity_grams }) => {
        const multiplier = quantity_grams / 100;
        console.log('Calculating nutrition for ingredient:', {
          name: ingredient.name,
          quantity: quantity_grams,
          multiplier,
          originalValues: {
            calories: ingredient.calories_per_100g,
            protein: ingredient.protein_per_100g,
            carbs: ingredient.carbs_per_100g,
            fats: ingredient.fats_per_100g,
            fiber: ingredient.fiber_per_100g
          },
          calculatedValues: {
            calories: ingredient.calories_per_100g * multiplier,
            protein: ingredient.protein_per_100g * multiplier,
            carbs: ingredient.carbs_per_100g * multiplier,
            fats: ingredient.fats_per_100g * multiplier,
            fiber: ingredient.fiber_per_100g * multiplier
          }
        });
        
        return {
          calories: acc.calories + (ingredient.calories_per_100g * multiplier),
          protein: acc.protein + (ingredient.protein_per_100g * multiplier),
          carbs: acc.carbs + (ingredient.carbs_per_100g * multiplier),
          fats: acc.fats + (ingredient.fats_per_100g * multiplier),
          fiber: acc.fiber + (ingredient.fiber_per_100g * multiplier),
        };
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }
    );
    
    console.log('Meal nutrition result:', mealNutrition);
    return mealNutrition;
  };

  const calculateTotalNutrition = (): MealNutrition => {
    const totalNutrition = meals.reduce(
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
    
    console.log('Total nutrition result:', totalNutrition);
    return totalNutrition;
  };

  console.log('Search results:', searchResults);

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
                      <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={searchOpen}
                            className="w-[300px] justify-between"
                          >
                            {selectedIngredient ? 
                              searchResults.find((item) => item.id === selectedIngredient)?.name :
                              "Search ingredient..."}
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <Command>
                            <CommandInput 
                              placeholder="Search ingredient..." 
                              value={searchQuery}
                              onValueChange={setSearchQuery}
                            />
                            <CommandEmpty>No ingredient found.</CommandEmpty>
                            <CommandList>
                              <CommandGroup>
                                {searchResults.map((ingredient) => (
                                  <CommandItem
                                    key={ingredient.id}
                                    value={ingredient.id}
                                    onSelect={(value) => {
                                      setSelectedIngredient(value);
                                      setSearchOpen(false);
                                    }}
                                  >
                                    {ingredient.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
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
                          <span>{calculateMealNutrition(mealIndex).calories.toFixed(1)} cal</span>
                          <span>{calculateMealNutrition(mealIndex).protein.toFixed(1)}g protein</span>
                          <span>{calculateMealNutrition(mealIndex).carbs.toFixed(1)}g carbs</span>
                          <span>{calculateMealNutrition(mealIndex).fats.toFixed(1)}g fats</span>
                          <span>{calculateMealNutrition(mealIndex).fiber.toFixed(1)}g fiber</span>
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
                  <span>{calculateTotalNutrition().calories.toFixed(1)} cal</span>
                  <span>{calculateTotalNutrition().protein.toFixed(1)}g protein</span>
                  <span>{calculateTotalNutrition().carbs.toFixed(1)}g carbs</span>
                  <span>{calculateTotalNutrition().fats.toFixed(1)}g fats</span>
                  <span>{calculateTotalNutrition().fiber.toFixed(1)}g fiber</span>
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
