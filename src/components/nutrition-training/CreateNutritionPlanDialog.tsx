
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Ingredient, PartialMeal, MealIngredient, PartialMealIngredient } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onPlanCreated: () => void;
};

export function CreateNutritionPlanDialog({ isOpen, onClose, onPlanCreated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [meals, setMeals] = useState<PartialMeal[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedMealIndex, setExpandedMealIndex] = useState<number | null>(null);
  const [selectedMealIndex, setSelectedMealIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const searchIngredients = async (search: string) => {
    if (!search.trim()) {
      setIngredients([]);
      return;
    }

    try {
      console.log("Searching for:", search.trim());

      const { data: coachIngredients, error: coachError } = await supabase
        .from("ingredients")
        .select()
        .or(`name.ilike.%${search.trim()}%,name.ilike.${search.trim()}%`)
        .limit(5);

      if (coachError) {
        console.error("Coach ingredients search error:", coachError);
        throw coachError;
      }

      console.log("Coach ingredients found:", coachIngredients);

      const { data: allCoachesIngredients, error: allCoachesError } = await supabase
        .from("ingredients_all_coaches")
        .select()
        .or(`name.ilike.%${search.trim()}%,name.ilike.${search.trim()}%`)
        .limit(5);

      if (allCoachesError) {
        console.error("All coaches ingredients search error:", allCoachesError);
        throw allCoachesError;
      }

      console.log("All coaches ingredients found:", allCoachesIngredients);

      const convertedAllCoachesIngredients: Ingredient[] = (allCoachesIngredients || [])
        .filter(item => item.name && item.calories_per_100g)
        .map(item => ({
          id: `template_${item.name}`,
          name: item.name || "",
          calories_per_100g: Number(item.calories_per_100g) || 0,
          protein_per_100g: Number(item.protein_per_100g) || 0,
          carbs_per_100g: Number(item.carbs_per_100g) || 0,
          fats_per_100g: Number(item.fats_per_100g) || 0,
          fiber_per_100g: Number(item.fibers_per_100g) || 0
        }));

      const combined = [...(coachIngredients || []), ...convertedAllCoachesIngredients];
      const uniqueIngredients = combined.filter((item, index, self) =>
        index === self.findIndex(t => t.name.toLowerCase() === item.name.toLowerCase())
      );

      console.log("Final unique ingredients:", uniqueIngredients);
      setIngredients(uniqueIngredients);
    } catch (error) {
      console.error("Error searching ingredients:", error);
      toast({
        title: "Error",
        description: "Failed to search ingredients",
        variant: "destructive",
      });
    }
  };

  const addMeal = () => {
    const lastMeal = meals[meals.length - 1];
    if (meals.length > 0 && (!lastMeal.ingredients || lastMeal.ingredients.length === 0)) {
      toast({
        title: "Warning",
        description: "Please add ingredients to the current meal before creating a new one",
        variant: "destructive",
      });
      return;
    }

    const defaultMealNames = ["Frukost", "Mellanmål", "Lunch", "Mellanmål", "Middag", "Mellanmål"];
    const newMealName = defaultMealNames[meals.length] || `Meal ${meals.length + 1}`;
    const newMealIndex = meals.length;
    setMeals([...meals, { name: newMealName, ingredients: [] }]);
    setExpandedMealIndex(newMealIndex);
    setSelectedMealIndex(newMealIndex);
  };

  const removeMeal = (index: number) => {
    setMeals(meals.filter((_, i) => i !== index));
  };

  const updateMealName = (index: number, name: string) => {
    const updatedMeals = [...meals];
    updatedMeals[index] = { ...updatedMeals[index], name };
    setMeals(updatedMeals);
  };

  const toggleMealExpansion = (index: number) => {
    setExpandedMealIndex(expandedMealIndex === index ? null : index);
  };

  const addIngredientToMeal = async (ingredient: Ingredient) => {
    if (selectedMealIndex === null) {
      toast({
        title: "Warning",
        description: "Please select a meal first",
        variant: "destructive",
      });
      return;
    }

    let ingredientId = ingredient.id;
    if (ingredient.id.startsWith('template_')) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");

        const { data: newIngredient, error } = await supabase
          .from('ingredients')
          .insert({
            name: ingredient.name,
            calories_per_100g: ingredient.calories_per_100g,
            protein_per_100g: ingredient.protein_per_100g,
            carbs_per_100g: ingredient.carbs_per_100g,
            fats_per_100g: ingredient.fats_per_100g,
            fiber_per_100g: ingredient.fiber_per_100g,
            coach_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        ingredientId = newIngredient.id;
        ingredient = newIngredient;
      } catch (error) {
        console.error("Error creating ingredient:", error);
        return;
      }
    }

    const updatedMeals = [...meals];
    const newIngredient: PartialMealIngredient = {
      ingredient_id: ingredientId,
      ingredient,
      quantity_grams: 100
    };
    updatedMeals[selectedMealIndex].ingredients.push(newIngredient);
    setMeals(updatedMeals);
    setSearchTerm("");
    setIngredients([]);
  };

  const updateIngredientQuantity = (mealIndex: number, ingredientIndex: number, quantity: number) => {
    const updatedMeals = [...meals];
    const mealIngredients = [...(updatedMeals[mealIndex].ingredients || [])];
    mealIngredients[ingredientIndex] = {
      ...mealIngredients[ingredientIndex],
      quantity_grams: quantity
    };
    updatedMeals[mealIndex] = { ...updatedMeals[mealIndex], ingredients: mealIngredients };
    setMeals(updatedMeals);
  };

  const removeIngredientFromMeal = (mealIndex: number, ingredientIndex: number) => {
    const updatedMeals = [...meals];
    const mealIngredients = [...(updatedMeals[mealIndex].ingredients || [])];
    mealIngredients.splice(ingredientIndex, 1);
    updatedMeals[mealIndex] = { ...updatedMeals[mealIndex], ingredients: mealIngredients };
    setMeals(updatedMeals);
  };

  const calculateMealNutrition = (ingredients: Partial<MealIngredient>[]) => {
    return ingredients.reduce(
      (acc, item) => {
        if (!item.ingredient || !item.quantity_grams) return acc;
        const multiplier = item.quantity_grams / 100;
        return {
          calories: acc.calories + item.ingredient.calories_per_100g * multiplier,
          protein: acc.protein + item.ingredient.protein_per_100g * multiplier,
          carbs: acc.carbs + item.ingredient.carbs_per_100g * multiplier,
          fats: acc.fats + item.ingredient.fats_per_100g * multiplier,
          fiber: acc.fiber + item.ingredient.fiber_per_100g * multiplier,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }
    );
  };

  const calculateTotalNutrition = () => {
    return meals.reduce(
      (acc, meal) => {
        if (!meal.ingredients) return acc;
        const mealNutrition = calculateMealNutrition(meal.ingredients);
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

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: planData, error: planError } = await supabase
        .from("nutrition_plans")
        .insert([
          {
            title,
            description,
            coach_id: user.id,
          },
        ])
        .select()
        .single();

      if (planError) throw planError;

      for (let i = 0; i < meals.length; i++) {
        const meal = meals[i];
        const { data: mealData, error: mealError } = await supabase
          .from("meals")
          .insert([
            {
              nutrition_plan_id: planData.id,
              name: meal.name || `Meal ${i + 1}`,
              order_index: i,
            },
          ])
          .select()
          .single();

        if (mealError) throw mealError;

        if (meal.ingredients && meal.ingredients.length > 0) {
          const { error: ingredientsError } = await supabase
            .from("meal_ingredients")
            .insert(
              meal.ingredients.map((ing) => ({
                meal_id: mealData.id,
                ingredient_id: ing.ingredient_id,
                quantity_grams: ing.quantity_grams,
              }))
            );

          if (ingredientsError) throw ingredientsError;
        }
      }

      toast({
        title: "Success",
        description: "Nutrition plan created successfully",
      });

      onClose();
      onPlanCreated();
    } catch (error) {
      console.error("Error creating nutrition plan:", error);
      toast({
        title: "Error",
        description: "Failed to create nutrition plan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalNutrition = calculateTotalNutrition();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl min-h-[90vh] max-h-[95vh] w-[98vw] overflow-hidden flex flex-col p-8 bg-gradient-to-b from-white to-gray-50">
        <DialogHeader className="border-b pb-6">
          <DialogTitle className="text-2xl font-bold text-primary">Create Nutrition Plan</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-6 mt-6">
          <div className="grid gap-6">
            <div className="grid grid-cols-4 items-center gap-6">
              <Label htmlFor="title" className="text-right font-semibold text-gray-700">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3 border-gray-300 focus:border-primary"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-6">
              <Label htmlFor="description" className="text-right font-semibold text-gray-700">
                Description
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3 border-gray-300 focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-6">
            <div className="col-span-3">
              <Input
                type="text"
                placeholder="Search ingredients..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  searchIngredients(e.target.value);
                }}
                className="w-full border-gray-300 focus:border-primary"
              />
              {searchTerm && ingredients.length > 0 && (
                <div className="absolute z-10 w-[calc(75%-1.5rem)] mt-1 bg-white border rounded-md shadow-lg">
                  {ingredients.map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => addIngredientToMeal(ingredient)}
                    >
                      {ingredient.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={addMeal} className="col-span-1 bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Meal
            </Button>
          </div>

          <ScrollArea className="flex-1 px-4 -mx-4">
            <div className="space-y-4">
              {meals.map((meal, mealIndex) => (
                <div 
                  key={mealIndex} 
                  className={`border rounded-lg bg-white shadow-sm transition-all ${
                    selectedMealIndex === mealIndex ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div 
                    className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      toggleMealExpansion(mealIndex);
                      setSelectedMealIndex(mealIndex);
                    }}
                  >
                    <Input
                      value={meal.name}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateMealName(mealIndex, e.target.value);
                      }}
                      className="w-48 border-gray-300 focus:border-primary"
                      placeholder="Meal name"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMeal(mealIndex);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      {expandedMealIndex === mealIndex ? (
                        <ChevronUp className="w-4 h-4 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                  </div>

                  {expandedMealIndex === mealIndex && (
                    <div className="p-4 border-t bg-gray-50">
                      {meal.ingredients && meal.ingredients.length > 0 && (
                        <div className="space-y-4">
                          {meal.ingredients.map((ingredient, ingredientIndex) => (
                            <div
                              key={ingredientIndex}
                              className="flex items-center gap-4 bg-white p-3 rounded-md shadow-sm"
                            >
                              <span className="flex-1 font-medium">{ingredient.ingredient.name}</span>
                              <Input
                                type="number"
                                value={ingredient.quantity_grams}
                                onChange={(e) =>
                                  updateIngredientQuantity(
                                    mealIndex,
                                    ingredientIndex,
                                    Number(e.target.value)
                                  )
                                }
                                className="w-24 border-gray-300 focus:border-primary"
                                min="0"
                              />
                              <span className="text-sm text-gray-500">grams</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  removeIngredientFromMeal(mealIndex, ingredientIndex)
                                }
                                className="hover:bg-gray-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}

                          <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
                            <h4 className="font-medium mb-3 text-gray-800">Meal Nutrition</h4>
                            <div className="text-sm text-gray-600 space-y-2">
                              {Object.entries(calculateMealNutrition(meal.ingredients)).map(
                                ([key, value]) => (
                                  <div key={key} className="flex justify-between">
                                    <span className="capitalize font-medium">{key}:</span>
                                    <span>
                                      {Math.round(value)}
                                      {key === "calories" ? " kcal" : "g"}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t pt-6 mt-6 bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold mb-4 text-gray-800">Total Daily Nutrition</h3>
            <div className="grid grid-cols-5 gap-6 text-center">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-700">Calories</div>
                <div className="text-lg font-semibold text-primary">{Math.round(totalNutrition.calories)} kcal</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-700">Protein</div>
                <div className="text-lg font-semibold text-primary">{Math.round(totalNutrition.protein)}g</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-700">Carbs</div>
                <div className="text-lg font-semibold text-primary">{Math.round(totalNutrition.carbs)}g</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-700">Fats</div>
                <div className="text-lg font-semibold text-primary">{Math.round(totalNutrition.fats)}g</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-700">Fiber</div>
                <div className="text-lg font-semibold text-primary">{Math.round(totalNutrition.fiber)}g</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t mt-auto">
            <Button variant="outline" onClick={onClose} className="border-gray-300 hover:bg-gray-50">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className="bg-primary hover:bg-primary/90">
              Create Plan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
