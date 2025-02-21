
import { Exercise } from "../types/exercise";

interface ExerciseListViewProps {
  exercises: Exercise[];
  onExerciseClick: (exercise: Exercise) => void;
}

export function ExerciseListView({ exercises, onExerciseClick }: ExerciseListViewProps) {
  return (
    <div className="space-y-2">
      {exercises.map((exercise) => (
        <div
          key={exercise.id}
          onClick={() => onExerciseClick(exercise)}
          className="p-4 bg-white/60 hover:bg-white/80 cursor-pointer border-b border-gray-200/50 transition-colors duration-200 flex justify-between items-center"
        >
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{exercise.name}</h3>
                {exercise.equipment_needed && (
                  <p className="text-sm text-gray-600 mt-0.5">
                    Equipment: {exercise.equipment_needed}
                  </p>
                )}
              </div>
              <span className="text-sm text-gray-500">{exercise.muscle_group}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
