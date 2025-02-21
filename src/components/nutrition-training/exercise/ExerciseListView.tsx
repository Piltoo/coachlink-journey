
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
              <h3 className="font-medium">{exercise.name}</h3>
              <span className="text-sm text-gray-500">{exercise.muscle_group}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{exercise.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
