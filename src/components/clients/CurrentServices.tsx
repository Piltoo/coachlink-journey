
interface CurrentServicesProps {
  hasNutritionPlan: boolean;
  hasWorkoutPlan: boolean;
  hasPersonalTraining: boolean;
}

export function CurrentServices({ 
  hasNutritionPlan, 
  hasWorkoutPlan, 
  hasPersonalTraining 
}: CurrentServicesProps) {
  return (
    <div className="flex gap-2">
      {hasNutritionPlan && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Nutrition
        </span>
      )}
      {hasWorkoutPlan && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          Training
        </span>
      )}
      {hasPersonalTraining && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          PT
        </span>
      )}
    </div>
  );
}
