
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Ingredient } from "./types";
import { EditIngredientForm } from "./EditIngredientForm";
import { updateIngredient, deleteIngredient } from "./ingredient-operations";

type EditIngredientDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  ingredient: Ingredient | null;
  onIngredientUpdated: () => void;
  groups: string[];
};

export function EditIngredientDialog({
  isOpen,
  onClose,
  ingredient,
  onIngredientUpdated,
  groups,
}: EditIngredientDialogProps) {
  const { toast } = useToast();
  const [editingIngredient, setEditingIngredient] = useState(ingredient ? {
    name: ingredient.name,
    calories_per_100g: ingredient.calories_per_100g.toString(),
    protein_per_100g: ingredient.protein_per_100g.toString(),
    carbs_per_100g: ingredient.carbs_per_100g.toString(),
    fats_per_100g: ingredient.fats_per_100g.toString(),
    fiber_per_100g: ingredient.fiber_per_100g.toString(),
    group: ingredient.group_name || "",
  } : null);

  const handleDeleteIngredient = async () => {
    if (!ingredient) return;

    try {
      await deleteIngredient(ingredient.id);
      
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
      await updateIngredient(ingredient.id, {
        name: editingIngredient.name,
        calories_per_100g: parseFloat(editingIngredient.calories_per_100g),
        protein_per_100g: parseFloat(editingIngredient.protein_per_100g),
        carbs_per_100g: parseFloat(editingIngredient.carbs_per_100g),
        fats_per_100g: parseFloat(editingIngredient.fats_per_100g),
        fiber_per_100g: parseFloat(editingIngredient.fiber_per_100g),
        group_name: editingIngredient.group,
      });

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

  if (!editingIngredient || !ingredient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit or Delete Ingredient</DialogTitle>
        </DialogHeader>
        <EditIngredientForm
          data={editingIngredient}
          groups={groups}
          onChange={setEditingIngredient}
        />
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
      </DialogContent>
    </Dialog>
  );
}
