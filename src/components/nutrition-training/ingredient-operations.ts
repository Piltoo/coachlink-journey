
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
  const { error } = await supabase
    .from('ingredients')
    .update(data)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteIngredient(id: string) {
  const { error } = await supabase
    .from('ingredients')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
