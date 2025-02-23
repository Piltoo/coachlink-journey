
import { Exercise } from "../types/exercise";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface ExerciseListViewProps {
  exercises: Exercise[];
  onExerciseClick: (exercise: Exercise) => void;
  selectedExerciseIds?: string[];
  hasActiveFilters?: boolean;
}

export function ExerciseListView({ 
  exercises, 
  onExerciseClick, 
  selectedExerciseIds = [],
  hasActiveFilters = false
}: ExerciseListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredExercises = exercises.filter(exercise => 
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (exercise.equipment_needed?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    exercise.muscle_group.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!hasActiveFilters) {
    return (
      <div className="space-y-4">
        <Input
          placeholder="Search exercises..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
        {searchQuery ? (
          filteredExercises.length > 0 ? (
            <div className="divide-y divide-border">
              {filteredExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  onClick={() => onExerciseClick(exercise)}
                  className="py-3 px-4 cursor-pointer hover:bg-accent/50 transition-colors"
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
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No exercises found matching "{searchQuery}"
            </div>
          )
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            Search for exercises or select a muscle group to start
          </div>
        )}
      </div>
    );
  }

  if (!exercises.length) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No exercises found
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {exercises.map((exercise) => (
        <div
          key={exercise.id}
          onClick={() => onExerciseClick(exercise)}
          className="py-3 px-4 cursor-pointer hover:bg-accent/50 transition-colors"
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
      ))}
    </div>
  );
}
