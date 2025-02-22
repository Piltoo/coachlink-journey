
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type IngredientFormData = {
  name: string;
  calories_per_100g: string;
  protein_per_100g: string;
  carbs_per_100g: string;
  fats_per_100g: string;
  fiber_per_100g: string;
  group: string;
};

type EditIngredientFormProps = {
  data: IngredientFormData;
  groups: string[];
  onChange: (data: IngredientFormData) => void;
};

export function EditIngredientForm({ data, groups, onChange }: EditIngredientFormProps) {
  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <Label htmlFor="edit-name">Name</Label>
        <Input
          id="edit-name"
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-group">Group</Label>
        <Select
          value={data.group}
          onValueChange={(value) => onChange({ ...data, group: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a group" />
          </SelectTrigger>
          <SelectContent>
            {groups.map((group) => (
              <SelectItem key={group} value={group}>
                {group}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-calories">Calories per 100g</Label>
          <Input
            id="edit-calories"
            type="number"
            value={data.calories_per_100g}
            onChange={(e) => onChange({ ...data, calories_per_100g: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-protein">Protein (g)</Label>
          <Input
            id="edit-protein"
            type="number"
            value={data.protein_per_100g}
            onChange={(e) => onChange({ ...data, protein_per_100g: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-carbs">Carbs (g)</Label>
          <Input
            id="edit-carbs"
            type="number"
            value={data.carbs_per_100g}
            onChange={(e) => onChange({ ...data, carbs_per_100g: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-fats">Fats (g)</Label>
          <Input
            id="edit-fats"
            type="number"
            value={data.fats_per_100g}
            onChange={(e) => onChange({ ...data, fats_per_100g: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-fiber">Fiber (g)</Label>
          <Input
            id="edit-fiber"
            type="number"
            value={data.fiber_per_100g}
            onChange={(e) => onChange({ ...data, fiber_per_100g: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
