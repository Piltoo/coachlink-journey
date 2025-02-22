
import { Exercise } from "../types/exercise";

interface ExerciseListViewProps {
  exercises: Exercise[];
  onExerciseClick: (exercise: Exercise) => void;
  selectedExerciseIds?: string[];
}

export function ExerciseListView({ exercises, onExerciseClick, selectedExerciseIds = [] }: ExerciseListViewProps) {
  if (!exercises.length) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No exercises found
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {exercises.map((exercise) => {
        const isSelected = selectedExerciseIds.includes(exercise.id);
        return (
          <div
            key={exercise.id}
            onClick={() => onExerciseClick(exercise)}
            className={`py-3 px-4 cursor-pointer hover:bg-accent/50 transition-colors ${
              isSelected ? 'bg-accent' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-sm">{exercise.name}</h4>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {exercise.equipment_needed}
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                {exercise.muscle_group}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
