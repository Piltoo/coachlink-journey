
export type Ingredient = {
  id: string;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
  fiber_per_100g: number;
};

export type Exercise = {
  id: string;
  name: string;
  description: string;
  muscle_group: string;
  start_position_image: string | null;
  mid_position_image: string | null;
  difficulty_level: string;
  equipment_needed: string | null;
  instructions: string;
};
