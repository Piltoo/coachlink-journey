
export type Ingredient = {
  id: string;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
  fiber_per_100g: number;
};

export type IngredientFormData = {
  name: string;
  calories_per_100g: string;
  protein_per_100g: string;
  carbs_per_100g: string;
  fats_per_100g: string;
  fiber_per_100g: string;
  group: string;
};

export type Meal = {
  id: string;
  nutrition_plan_id: string;
  name: string;
  order_index: number;
  ingredients: MealIngredient[];
};

export type MealIngredient = {
  id: string;
  meal_id: string;
  ingredient_id: string;
  ingredient: Ingredient;
  quantity_grams: number;
};

export type PartialMealIngredient = Omit<MealIngredient, 'id' | 'meal_id'>;

export type MealNutrition = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
};
