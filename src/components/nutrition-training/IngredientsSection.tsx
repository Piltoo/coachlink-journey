
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Ingredient = {
  id: string;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
  fiber_per_100g: number;
};

type IngredientsSectionProps = {
  ingredients: Ingredient[];
  onIngredientAdded: () => void;
};

export function IngredientsSection({ ingredients, onIngredientAdded }: IngredientsSectionProps) {
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [showEditIngredient, setShowEditIngredient] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [groups, setGroups] = useState<string[]>([]);
  const [editingIngredient, setEditingIngredient] = useState({
    name: "",
    calories_per_100g: "",
    protein_per_100g: "",
    carbs_per_100g: "",
    fats_per_100g: "",
    fiber_per_100g: "",
  });
  const [newIngredient, setNewIngredient] = useState({
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
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('ingredients_all_coaches')
        .select('grop')
        .not('grop', 'is', null);

      if (error) throw error;

      // Get unique groups and remove any nulls or empty strings
      const uniqueGroups = [...new Set(data.map(item => item.grop))].filter(Boolean);
      setGroups(uniqueGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const handleAddIngredient = async () => {
    if (!newIngredient.group) {
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
        name: newIngredient.name,
        calories_per_100g: parseFloat(newIngredient.calories_per_100g),
        protein_per_100g: parseFloat(newIngredient.protein_per_100g),
        carbs_per_100g: parseFloat(newIngredient.carbs_per_100g),
        fats_per_100g: parseFloat(newIngredient.fats_per_100g),
        fiber_per_100g: parseFloat(newIngredient.fiber_per_100g),
        coach_id: user.id,
        group: newIngredient.group,
      };

      const { error } = await supabase
        .from('ingredients')
        .insert([ingredientData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ingredient added successfully",
      });

      setShowAddIngredient(false);
      setNewIngredient({
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

  const handleIngredientClick = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setEditingIngredient({
      name: ingredient.name,
      calories_per_100g: ingredient.calories_per_100g.toString(),
      protein_per_100g: ingredient.protein_per_100g.toString(),
      carbs_per_100g: ingredient.carbs_per_100g.toString(),
      fats_per_100g: ingredient.fats_per_100g.toString(),
      fiber_per_100g: ingredient.fiber_per_100g.toString(),
    });
    setShowEditIngredient(true);
  };

  const handleDeleteIngredient = async () => {
    if (!selectedIngredient) return;

    try {
      const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', selectedIngredient.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ingredient deleted successfully",
      });

      setShowEditIngredient(false);
      onIngredientAdded();
    } catch (error) {
      console.error("Error deleting ingredient:", error);
      toast({
        title: "Error",
        description: "Failed to delete ingredient",
        variant: "destructive",
      });
    }
  };

  const handleUpdateIngredient = async () => {
    if (!selectedIngredient) return;

    try {
      const { error } = await supabase
        .from('ingredients')
        .update({
          name: editingIngredient.name,
          calories_per_100g: parseFloat(editingIngredient.calories_per_100g),
          protein_per_100g: parseFloat(editingIngredient.protein_per_100g),
          carbs_per_100g: parseFloat(editingIngredient.carbs_per_100g),
          fats_per_100g: parseFloat(editingIngredient.fats_per_100g),
          fiber_per_100g: parseFloat(editingIngredient.fiber_per_100g),
        })
        .eq('id', selectedIngredient.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ingredient updated successfully",
      });

      setShowEditIngredient(false);
      onIngredientAdded();
    } catch (error) {
      console.error("Error updating ingredient:", error);
      toast({
        title: "Error",
        description: "Failed to update ingredient",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white/40 backdrop-blur-lg rounded-lg border border-gray-200/50 p-6 shadow-sm transition-all duration-200 ease-in-out">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Ingredients List</h2>
        <Dialog open={showAddIngredient} onOpenChange={setShowAddIngredient}>
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
                  value={newIngredient.name}
                  onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                  placeholder="Enter ingredient name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group">Group</Label>
                <Select
                  value={newIngredient.group}
                  onValueChange={(value) => setNewIngredient({ ...newIngredient, group: value })}
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
                  <Label htmlFor="calories">Calories per 100g</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={newIngredient.calories_per_100g}
                    onChange={(e) => setNewIngredient({ ...newIngredient, calories_per_100g: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    value={newIngredient.protein_per_100g}
                    onChange={(e) => setNewIngredient({ ...newIngredient, protein_per_100g: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    value={newIngredient.carbs_per_100g}
                    onChange={(e) => setNewIngredient({ ...newIngredient, carbs_per_100g: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fats">Fats (g)</Label>
                  <Input
                    id="fats"
                    type="number"
                    value={newIngredient.fats_per_100g}
                    onChange={(e) => setNewIngredient({ ...newIngredient, fats_per_100g: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fiber">Fiber (g)</Label>
                  <Input
                    id="fiber"
                    type="number"
                    value={newIngredient.fiber_per_100g}
                    onChange={(e) => setNewIngredient({ ...newIngredient, fiber_per_100g: e.target.value })}
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
      </div>
      
      {ingredients.length > 0 ? (
        <div className="space-y-4">
          {ingredients.map((ingredient) => (
            <div 
              key={ingredient.id} 
              className="p-4 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg transition-all duration-200 ease-in-out cursor-pointer hover:bg-white/80"
              onClick={() => handleIngredientClick(ingredient)}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-medium">{ingredient.name}</h3>
                <p className="text-sm text-gray-500">
                  Per 100g: {ingredient.calories_per_100g} cal | P: {ingredient.protein_per_100g}g | 
                  C: {ingredient.carbs_per_100g}g | F: {ingredient.fats_per_100g}g | Fiber: {ingredient.fiber_per_100g}g
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No ingredients added yet.
        </div>
      )}

      <Dialog open={showEditIngredient} onOpenChange={setShowEditIngredient}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit or Delete Ingredient</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editingIngredient.name}
                onChange={(e) => setEditingIngredient({ ...editingIngredient, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-calories">Calories per 100g</Label>
                <Input
                  id="edit-calories"
                  type="number"
                  value={editingIngredient.calories_per_100g}
                  onChange={(e) => setEditingIngredient({ ...editingIngredient, calories_per_100g: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-protein">Protein (g)</Label>
                <Input
                  id="edit-protein"
                  type="number"
                  value={editingIngredient.protein_per_100g}
                  onChange={(e) => setEditingIngredient({ ...editingIngredient, protein_per_100g: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-carbs">Carbs (g)</Label>
                <Input
                  id="edit-carbs"
                  type="number"
                  value={editingIngredient.carbs_per_100g}
                  onChange={(e) => setEditingIngredient({ ...editingIngredient, carbs_per_100g: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-fats">Fats (g)</Label>
                <Input
                  id="edit-fats"
                  type="number"
                  value={editingIngredient.fats_per_100g}
                  onChange={(e) => setEditingIngredient({ ...editingIngredient, fats_per_100g: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-fiber">Fiber (g)</Label>
                <Input
                  id="edit-fiber"
                  type="number"
                  value={editingIngredient.fiber_per_100g}
                  onChange={(e) => setEditingIngredient({ ...editingIngredient, fiber_per_100g: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter className="flex justify-between gap-4 sm:justify-between">
              <Button
                variant="destructive"
                onClick={handleDeleteIngredient}
                className="flex-1"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <Button
                onClick={handleUpdateIngredient}
                className="flex-1 bg-[#a7cca4] hover:bg-[#96bb93] text-white"
              >
                Update Values
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
