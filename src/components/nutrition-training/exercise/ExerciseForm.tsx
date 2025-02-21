
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { difficultyLevels, muscleGroups } from "../types/exercise";

interface ExerciseFormData {
  name: string;
  description: string;
  muscle_group: string;
  difficulty_level: string;
  equipment_needed: string;
  instructions: string;
  start_position_image: string;
  mid_position_image: string;
}

interface ExerciseFormProps {
  data: ExerciseFormData;
  onChange: (data: ExerciseFormData) => void;
  isEdit?: boolean;
}

export function ExerciseForm({ data, onChange, isEdit = false }: ExerciseFormProps) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Exercise Name</Label>
          <Input
            id="name"
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            placeholder="Enter exercise name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="muscle-group">Muscle Group</Label>
          <Select
            value={data.muscle_group}
            onValueChange={(value) => onChange({ ...data, muscle_group: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select muscle group" />
            </SelectTrigger>
            <SelectContent>
              {muscleGroups.filter(group => group !== "All").map((group) => (
                <SelectItem key={group} value={group}>{group}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty Level</Label>
          <Select
            value={data.difficulty_level}
            onValueChange={(value) => onChange({ ...data, difficulty_level: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              {difficultyLevels.map((level) => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="equipment">Equipment Needed</Label>
          <Input
            id="equipment"
            value={data.equipment_needed}
            onChange={(e) => onChange({ ...data, equipment_needed: e.target.value })}
            placeholder="Required equipment"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Short Description</Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          placeholder="Brief description of the exercise"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="instructions">Detailed Instructions</Label>
        <Textarea
          id="instructions"
          value={data.instructions}
          onChange={(e) => onChange({ ...data, instructions: e.target.value })}
          placeholder="Step-by-step instructions"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-image">Start Position Image URL</Label>
          <Input
            id="start-image"
            value={data.start_position_image}
            onChange={(e) => onChange({ ...data, start_position_image: e.target.value })}
            placeholder="URL for starting position"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mid-image">Mid Position Image URL</Label>
          <Input
            id="mid-image"
            value={data.mid_position_image}
            onChange={(e) => onChange({ ...data, mid_position_image: e.target.value })}
            placeholder="URL for mid position"
          />
        </div>
      </div>
    </div>
  );
}
