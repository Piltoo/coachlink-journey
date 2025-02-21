
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Ingredient = {
  id: string;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
};

type IngredientsSectionProps = {
  ingredients: Ingredient[];
  onIngredientAdded: () => void;
};

export function IngredientsSection({ ingredients, onIngredientAdded }: IngredientsSectionProps) {
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    calories_per_100g: "",
    protein_per_100g: "",
    carbs_per_100g: "",
    fats_per_100g: "",
  });
  const { toast } = useToast();

  const handleAddIngredient = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const ingredientData = {
        name: newIngredient.name,
        calories_per_100g: parseFloat(newIngredient.calories_per_100g),
        protein_per_100g: parseFloat(newIngredient.protein_per_100g),
        carbs_per_100g: parseFloat(newIngredient.carbs_per_100g),
        fats_per_100g: parseFloat(newIngredient.fats_per_100g),
        coach_id: user.id,
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
    <div className="bg-white">
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
            <div key={ingredient.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">{ingredient.name}</h3>
                <p className="text-sm text-gray-500">
                  Per 100g: {ingredient.calories_per_100g} cal | P: {ingredient.protein_per_100g}g | 
                  C: {ingredient.carbs_per_100g}g | F: {ingredient.fats_per_100g}g
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
    </div>
  );
}
