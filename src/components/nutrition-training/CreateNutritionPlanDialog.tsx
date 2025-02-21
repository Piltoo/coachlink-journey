
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
      <DialogContent className="max-w-6xl min-h-[80vh] max-h-[90vh] w-[95vw] overflow-hidden flex flex-col p-6">
        <DialogHeader>
          <DialogTitle className="text-xl">Create Nutrition Plan</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-3">
              <Input
                type="text"
                placeholder="Search ingredients..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  searchIngredients(e.target.value);
                }}
              />
              {searchTerm && ingredients.length > 0 && (
                <div className="absolute z-10 w-[calc(75%-1rem)] mt-1 bg-white border rounded-md shadow-lg">
                  {ingredients.map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => addIngredientToMeal(ingredient)}
                    >
                      {ingredient.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={addMeal} className="col-span-1">
              <Plus className="w-4 h-4 mr-2" />
              Add Meal
            </Button>
          </div>

          <ScrollArea className="flex-1 px-4">
            <div className="space-y-4">
              {meals.map((meal, mealIndex) => (
                <div 
                  key={mealIndex} 
                  className={`border rounded-lg ${selectedMealIndex === mealIndex ? 'ring-2 ring-primary' : ''}`}
                >
                  <div 
                    className="flex justify-between items-center p-4 cursor-pointer"
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
                      className="w-48"
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
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>

                  {expandedMealIndex === mealIndex && (
                    <div className="p-4 border-t">
                      {meal.ingredients && meal.ingredients.length > 0 && (
                        <div className="space-y-4">
                          {meal.ingredients.map((ingredient, ingredientIndex) => (
                            <div
                              key={ingredientIndex}
                              className="flex items-center gap-4 bg-gray-50 p-2 rounded"
                            >
                              <span className="flex-1">{ingredient.ingredient.name}</span>
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
                                className="w-24"
                                min="0"
                              />
                              <span className="text-sm text-gray-500">grams</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  removeIngredientFromMeal(mealIndex, ingredientIndex)
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}

                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium mb-2">Meal Nutrition</h4>
                            <div className="text-sm text-gray-600">
                              {Object.entries(calculateMealNutrition(meal.ingredients)).map(
                                ([key, value]) => (
                                  <div key={key} className="flex justify-between">
                                    <span className="capitalize">{key}:</span>
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

          <div className="border-t pt-4 mt-4">
            <h3 className="font-medium mb-2">Total Daily Nutrition</h3>
            <div className="grid grid-cols-5 gap-4 text-center">
              <div>
                <div className="font-medium">Calories</div>
                <div>{Math.round(totalNutrition.calories)} kcal</div>
              </div>
              <div>
                <div className="font-medium">Protein</div>
                <div>{Math.round(totalNutrition.protein)}g</div>
              </div>
              <div>
                <div className="font-medium">Carbs</div>
                <div>{Math.round(totalNutrition.carbs)}g</div>
              </div>
              <div>
                <div className="font-medium">Fats</div>
                <div>{Math.round(totalNutrition.fats)}g</div>
              </div>
              <div>
                <div className="font-medium">Fiber</div>
                <div>{Math.round(totalNutrition.fiber)}g</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              Create Plan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
