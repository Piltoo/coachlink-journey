
import { Exercise } from "../types/exercise";

interface ExerciseCardViewProps {
  exercises: Exercise[];
  onExerciseClick: (exercise: Exercise) => void;
}

export function ExerciseCardView({ exercises, onExerciseClick }: ExerciseCardViewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {exercises.map((exercise) => (
        <div
          key={exercise.id}
          className="p-4 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg transition-all duration-200 ease-in-out cursor-pointer hover:bg-white/80"
          onClick={() => onExerciseClick(exercise)}
        >
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-lg">{exercise.name}</h3>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                {exercise.difficulty_level}
              </span>
            </div>
            <p className="text-sm text-gray-600">{exercise.description}</p>
            <div className="flex items-center text-sm text-gray-500">
              <span className="font-medium">Muscle Group:</span>
              <span className="ml-2">{exercise.muscle_group}</span>
            </div>
            {exercise.equipment_needed && (
              <div className="flex items-center text-sm text-gray-500">
                <span className="font-medium">Equipment:</span>
                <span className="ml-2">{exercise.equipment_needed}</span>
              </div>
            )}
            {(exercise.start_position_image || exercise.mid_position_image) && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {exercise.start_position_image && (
                  <img
                    src={exercise.start_position_image}
                    alt="Start position"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                )}
                {exercise.mid_position_image && (
                  <img
                    src={exercise.mid_position_image}
                    alt="Mid position"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
