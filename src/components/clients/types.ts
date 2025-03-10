
export interface Client {
  id: string;
  full_name: string | null;
  email: string;
  status: string;
  hasNutritionPlan: boolean;
  hasWorkoutPlan: boolean;
  hasPersonalTraining: boolean;
  requested_services: string[];
  has_completed_assessment?: boolean;
}
