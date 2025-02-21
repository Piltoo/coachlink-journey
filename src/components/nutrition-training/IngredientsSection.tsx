
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AddIngredientDialog } from "./AddIngredientDialog";
import { EditIngredientDialog } from "./EditIngredientDialog";
import { IngredientSearch } from "./IngredientSearch";
import { Ingredient } from "./types";

type IngredientsSectionProps = {
  ingredients: Ingredient[];
  onIngredientAdded: () => void;
};

export function IngredientsSection({ ingredients, onIngredientAdded }: IngredientsSectionProps) {
  const [showEditIngredient, setShowEditIngredient] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [groups, setGroups] = useState<string[]>([]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      console.log("Fetching groups...");
      const { data, error } = await supabase
        .from('ingredients_all_coaches')
        .select('grop')
        .not('grop', 'is', null)
        .order('grop');

      if (error) {
        console.error("Error fetching groups:", error);
        throw error;
      }

      const uniqueGroups = Array.from(new Set(
        data
          .map(item => item.grop)
          .filter((group): group is string => 
            Boolean(group) && group.trim() !== ''
          )
      )).sort();

      console.log("Fetched groups:", uniqueGroups);
      setGroups(uniqueGroups);
    } catch (error) {
      console.error("Error in fetchGroups:", error);
    }
  };

  const handleIngredientClick = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setShowEditIngredient(true);
  };

  return (
    <div className="bg-white/40 backdrop-blur-lg rounded-lg border border-gray-200/50 p-6 shadow-sm transition-all duration-200 ease-in-out">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Ingredients List</h2>
        <AddIngredientDialog groups={groups} onIngredientAdded={onIngredientAdded} />
      </div>

      <IngredientSearch onIngredientAdded={onIngredientAdded} />
      
      {ingredients.length > 0 ? (
        <div className="space-y-4">
          {ingredients.map((ingredient) => (
            <div 
              key={ingredient.id} 
              className="p-4 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg transition-all duration-200 ease-in-out cursor-pointer hover:bg-white/80"
              onClick={() => handleIngredientClick(ingredient)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{ingredient.name}</h3>
                  <p className="text-sm text-gray-500">{ingredient.group_name}</p>
                </div>
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

      <EditIngredientDialog
        isOpen={showEditIngredient}
        onClose={() => setShowEditIngredient(false)}
        ingredient={selectedIngredient}
        onIngredientUpdated={onIngredientAdded}
        groups={groups}
      />
    </div>
  );
}
