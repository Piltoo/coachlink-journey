
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IngredientFormData } from "./types";

type AddIngredientDialogProps = {
  groups: string[];
  onIngredientAdded: () => void;
};

export function AddIngredientDialog({ groups: userGroups, onIngredientAdded }: AddIngredientDialogProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [allGroups, setAllGroups] = useState<string[]>([]);
  const [formData, setFormData] = useState<IngredientFormData>({
    name: "",
    calories_per_100g: "",
    protein_per_100g: "",
    carbs_per_100g: "",
    fats_per_100g: "",
    fiber_per_100g: "",
    group: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAllGroups();
  }, []);

  const fetchAllGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('ingredients_all_coaches')
        .select('grop')
        .not('grop', 'is', null)
        .order('grop');

      if (error) throw error;

      const uniqueGroups = Array.from(new Set(
        data
          .map(item => item.grop)
          .filter((group): group is string => 
            Boolean(group) && group.trim() !== ''
          )
      )).sort();

      // Merge with user's groups to ensure we include any new groups they've added
      const mergedGroups = Array.from(new Set([...uniqueGroups, ...userGroups])).sort();
      setAllGroups(mergedGroups);
    } catch (error) {
      console.error("Error fetching predefined groups:", error);
    }
  };

  const handleAddIngredient = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the ingredient",
        variant: "destructive",
      });
      return;
    }

    if (!formData.group) {
      toast({
        title: "Error",
        description: "Please select a group for the ingredient",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const ingredientData = {
        name: formData.name.trim(),
        calories_per_100g: parseFloat(formData.calories_per_100g) || 0,
        protein_per_100g: parseFloat(formData.protein_per_100g) || 0,
        carbs_per_100g: parseFloat(formData.carbs_per_100g) || 0,
        fats_per_100g: parseFloat(formData.fats_per_100g) || 0,
        fiber_per_100g: parseFloat(formData.fiber_per_100g) || 0,
        coach_id: user.id,
        group_name: formData.group,
      };

      const { error } = await supabase
        .from('ingredients')
        .insert([ingredientData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ingredient added successfully",
      });

      setShowDialog(false);
      setFormData({
        name: "",
        calories_per_100g: "",
        protein_per_100g: "",
        carbs_per_100g: "",
        fats_per_100g: "",
        fiber_per_100g: "",
        group: "",
      });
      onIngredientAdded();
    } catch (error) {
      console.error("Error adding ingredient:", error);
      toast({
        title: "Error",
        description: "Failed to add ingredient",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button className="bg-[#a7cca4] hover:bg-[#96bb93] text-white font-medium">
          <Plus className="mr-2 h-4 w-4" />
          Add New Ingredient
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Ingredient</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter ingredient name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="group">Group</Label>
            <Select
              value={formData.group}
              onValueChange={(value) => setFormData({ ...formData, group: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent>
                {allGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories">Calories per 100g</Label>
              <Input
                id="calories"
                type="number"
                value={formData.calories_per_100g}
                onChange={(e) => setFormData({ ...formData, calories_per_100g: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protein">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                value={formData.protein_per_100g}
                onChange={(e) => setFormData({ ...formData, protein_per_100g: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input
                id="carbs"
                type="number"
                value={formData.carbs_per_100g}
                onChange={(e) => setFormData({ ...formData, carbs_per_100g: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fats">Fats (g)</Label>
              <Input
                id="fats"
                type="number"
                value={formData.fats_per_100g}
                onChange={(e) => setFormData({ ...formData, fats_per_100g: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fiber">Fiber (g)</Label>
              <Input
                id="fiber"
                type="number"
                value={formData.fiber_per_100g}
                onChange={(e) => setFormData({ ...formData, fiber_per_100g: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>
          <Button onClick={handleAddIngredient} className="w-full bg-[#a7cca4] hover:bg-[#96bb93] text-white">
            Add Ingredient
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
