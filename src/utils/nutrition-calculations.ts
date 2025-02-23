
import { MealItem } from "@/hooks/use-nutrition-plan";
import { Ingredient } from "@/components/nutrition-training/types";

export const parseNutritionValue = (value: string | number | null): number => {
  if (value === null || value === undefined) return 0;
  const parsed = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(parsed) ? 0 : parsed;
};

export const calculateNutrition = (ingredient: Ingredient, grams: number) => {
  const multiplier = Math.max(0, grams) / 100;
  return {
    calories: parseNutritionValue(ingredient.calories_per_100g) * multiplier,
    protein: parseNutritionValue(ingredient.protein_per_100g) * multiplier,
    carbs: parseNutritionValue(ingredient.carbs_per_100g) * multiplier,
    fats: parseNutritionValue(ingredient.fats_per_100g) * multiplier,
    fiber: parseNutritionValue(ingredient.fiber_per_100g) * multiplier,
  };
};

export const calculateTotalNutrition = (meals: { items: MealItem[] }[]) => {
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
