
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { GripVertical, ArrowRight, X } from "lucide-react";
import { Exercise, SelectedReplacement } from "../types/training";

interface ExerciseListProps {
  exercises: Exercise[];
  availableExercises: Exercise[];
  draggedIndex: number | null;
  openPopoverIndex: number | null;
  selectedReplacement: SelectedReplacement;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onExerciseChange: (index: number, field: 'sets' | 'reps' | 'weight' | 'notes', value: string) => void;
  onPopoverChange: (index: number | null) => void;
  onReplaceSelection: (index: number, exercise: Exercise, checked: boolean) => void;
  onConfirmReplacement: () => void;
  onRemoveExercise: (index: number) => void;
}

export function ExerciseList({
  exercises,
  availableExercises,
  draggedIndex,
  openPopoverIndex,
  selectedReplacement,
  onDragStart,
  onDragOver,
  onDragEnd,
  onExerciseChange,
  onPopoverChange,
  onReplaceSelection,
  onConfirmReplacement,
  onRemoveExercise
}: ExerciseListProps) {
  return (
    <ScrollArea className="h-[300px] border rounded-md p-4">
      {exercises.map((exercise, index) => (
        <div
          key={exercise.id}
          draggable
          onDragStart={() => onDragStart(index)}
          onDragOver={(e) => onDragOver(e, index)}
          onDragEnd={onDragEnd}
          className="flex items-center gap-4 p-2 border-b last:border-b-0 cursor-move hover:bg-accent/5"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1 space-y-2">
            <Popover 
              open={openPopoverIndex === index} 
              onOpenChange={(open) => onPopoverChange(open ? index : null)}
            >
              <PopoverTrigger asChild>
                <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
                  <div className="text-left">
                    <h5 className="font-medium">{exercise.name}</h5>
                    <p className="text-sm text-muted-foreground">
                      {exercise.equipment_needed || 'No equipment needed'}
                    </p>
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0">
                <div className="p-4 border-b">
                  <h4 className="font-medium text-sm">Select a replacement exercise</h4>
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="p-2">
                    {availableExercises
                      .filter(e => e.muscle_group === exercise.muscle_group && e.id !== exercise.id)
                      .map(e => (
                        <div
                          key={e.id}
                          className="flex items-center justify-between p-2 hover:bg-accent/5 rounded-md"
                        >
                          <span className="font-medium">{e.name}</span>
                          <Checkbox 
                            checked={selectedReplacement.exercise?.id === e.id}
                            onCheckedChange={(checked) => onReplaceSelection(index, e, checked as boolean)}
                          />
                        </div>
                      ))}
                  </div>
                </ScrollArea>
                {selectedReplacement.exercise && (
                  <div className="p-2 border-t">
                    <Button 
                      className="w-full" 
                      onClick={onConfirmReplacement}
                    >
                      Replace with {selectedReplacement.exercise.name} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemoveExercise(index)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ExerciseFields 
            exercise={exercise}
            index={index}
            onExerciseChange={onExerciseChange}
          />
        </div>
      ))}
    </ScrollArea>
  );
}
