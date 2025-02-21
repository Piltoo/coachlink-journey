
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

export const muscleGroups = [
  "All",
  "Shoulders",
  "Chest",
  "Biceps",
  "Triceps",
  "Abdominal",
  "Quadriceps",
  "Hamstrings",
  "Gluts"
] as const;

export const difficultyLevels = [
  "Beginner",
  "Intermediate",
  "Advanced",
] as const;

