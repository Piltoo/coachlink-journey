
export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscle_group: string;
  equipment_needed?: string;
  sets?: number;
  reps?: number;
  weight?: number;
  notes?: string;
  order_index: number;
  difficulty_level?: string;
  instructions?: string;
}

export interface SelectedReplacement {
  index: number;
  exercise: Exercise | null;
}

export interface TrainingPlanDetailsProps {
  plan: {
    id: string;
    name: string;
    description: string;
    exercises?: string[];
    exercise_details?: Array<{
      exercise_id: string;
      sets: number;
      reps: number;
      weight: number;
      notes: string;
      order_index: number;
      description: string;
      muscle_group: string;
      equipment_needed: string;
      difficulty_level: string;
      instructions: string;
    }>;
  };
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}
