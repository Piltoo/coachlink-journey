
import { Exercise } from "../types/training";

interface ExerciseFieldsProps {
  exercise: Exercise;
  index: number;
  onExerciseChange: (index: number, field: 'sets' | 'reps' | 'weight' | 'notes', value: string) => void;
}

export function ExerciseFields({ exercise, index, onExerciseChange }: ExerciseFieldsProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-center">
        <label className="text-xs text-muted-foreground">Sets</label>
        <input
          type="number"
          value={exercise.sets}
          onChange={(e) => onExerciseChange(index, 'sets', e.target.value)}
          className="w-16 p-1 border rounded text-center"
          min="0"
        />
      </div>
      <div className="flex flex-col items-center">
        <label className="text-xs text-muted-foreground">Reps</label>
        <input
          type="number"
          value={exercise.reps}
          onChange={(e) => onExerciseChange(index, 'reps', e.target.value)}
          className="w-16 p-1 border rounded text-center"
          min="0"
        />
      </div>
      <div className="flex flex-col items-center">
        <label className="text-xs text-muted-foreground">Weight</label>
        <input
          type="number"
          value={exercise.weight}
          onChange={(e) => onExerciseChange(index, 'weight', e.target.value)}
          className="w-16 p-1 border rounded text-center"
          min="0"
        />
      </div>
      <div className="flex flex-col items-center">
        <label className="text-xs text-muted-foreground">Notes</label>
        <input
          type="text"
          value={exercise.notes}
          onChange={(e) => onExerciseChange(index, 'notes', e.target.value)}
          className="w-16 p-1 border rounded text-center"
        />
      </div>
    </div>
  );
}
