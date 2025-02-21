import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Ingredient } from "./types";

type EditIngredientDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  ingredient: Ingredient | null;
  onIngredientUpdated: () => void;
};

export function EditIngredientDialog({
  isOpen,
  onClose,
  ingredient,
  onIngredientUpdated,
}: EditIngredientDialogProps) {
  const { toast } = useToast();
  const [editingIngredient, setEditingIngredient] = useState(ingredient ? {
    name: ingredient.name,
    calories_per_100g: ingredient.calories_per_100g.toString(),
    protein_per_100g: ingredient.protein_per_100g.toString(),
    carbs_per_100g: ingredient.carbs_per_100g.toString(),
    fats_per_100g: ingredient.fats_per_100g.toString(),
    fiber_per_100g: ingredient.fiber_per_100g.toString(),
  } : null);

  const handleDeleteIngredient = async () => {
    if (!ingredient) return;

    try {
      const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', ingredient.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ingredient deleted successfully",
      });

      onClose();
      onIngredientUpdated();
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
    if (!ingredient || !editingIngredient) return;

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
        .eq('id', ingredient.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ingredient updated successfully",
      });

      onClose();
      onIngredientUpdated();
    } catch (error) {
      console.error("Error updating ingredient:", error);
      toast({
        title: "Error",
        description: "Failed to update ingredient",
        variant: "destructive",
      });
    }
  };

  if (!editingIngredient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
  );
}
