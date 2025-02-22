
import { supabase } from "@/integrations/supabase/client";
import { Ingredient } from "./types";

type IngredientUpdateData = {
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
  fiber_per_100g: number;
  group_name: string;
};

export async function updateIngredient(id: string, data: IngredientUpdateData) {
  const { data: updatedData, error } = await supabase
    .from('ingredients')
    .update({
      name: data.name,
      calories_per_100g: data.calories_per_100g,
      protein_per_100g: data.protein_per_100g,
      carbs_per_100g: data.carbs_per_100g,
      fats_per_100g: data.fats_per_100g,
      fiber_per_100g: data.fiber_per_100g,
      group_name: data.group_name
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating ingredient:', error);
    throw error;
  }

  return updatedData;
}

export async function deleteIngredient(id: string) {
  const { error } = await supabase
    .from('ingredients')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting ingredient:', error);
    throw error;
  }
}
