
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AddIngredientDialog } from "./AddIngredientDialog";
import { EditIngredientDialog } from "./EditIngredientDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Ingredient } from "./types";

type IngredientsSectionProps = {
  ingredients: Ingredient[];
  onIngredientAdded: () => void;
};

type SearchIngredient = {
  name: string;
  calories_per_100g: number;
  protein_per_100g: string;
  carbs_per_100g: string;
  fats_per_100g: string;
  fibers_per_100g: string;
};

export function IngredientsSection({ ingredients, onIngredientAdded }: IngredientsSectionProps) {
  const [showEditIngredient, setShowEditIngredient] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [groups, setGroups] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchIngredient[]>([]);
  const { toast } = useToast();

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

  const handleSearch = async (search: string) => {
    console.log("Searching for:", search);
    setSearchTerm(search);
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('ingredients_all_coaches')
        .select('*')
        .ilike('name', `%${search}%`);

      console.log("Search results:", data);
      console.log("Search error:", error);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error("Error searching ingredients:", error);
      toast({
        title: "Error",
        description: "Failed to search ingredients",
        variant: "destructive",
      });
    }
  };

  const handleAddFromSearch = async (ingredient: SearchIngredient) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      console.log("Adding ingredient:", ingredient);

      const { error } = await supabase
        .from('ingredients')
        .insert([{
          name: ingredient.name,
          calories_per_100g: ingredient.calories_per_100g,
          protein_per_100g: parseFloat(ingredient.protein_per_100g) || 0,
          carbs_per_100g: parseFloat(ingredient.carbs_per_100g) || 0,
          fats_per_100g: parseFloat(ingredient.fats_per_100g) || 0,
          fiber_per_100g: parseFloat(ingredient.fibers_per_100g) || 0,
          coach_id: user.id,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ingredient added to your list",
      });
      
      setSearchTerm("");
      setSearchResults([]);
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
    setShowEditIngredient(true);
  };

  return (
    <div className="bg-white/40 backdrop-blur-lg rounded-lg border border-gray-200/50 p-6 shadow-sm transition-all duration-200 ease-in-out">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Ingredients List</h2>
        <AddIngredientDialog groups={groups} onIngredientAdded={onIngredientAdded} />
      </div>

      <div className="mb-6 relative">
        <Input
          type="text"
          placeholder="Search ingredients database..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full"
        />
        {searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
            {searchResults.map((ingredient, index) => (
              <div
                key={`${ingredient.name}-${index}`}
                className="p-3 hover:bg-gray-50 flex justify-between items-center border-b last:border-b-0"
              >
                <div>
                  <div className="font-medium">{ingredient.name}</div>
                  <div className="text-sm text-gray-500">
                    {ingredient.calories_per_100g} cal | P: {ingredient.protein_per_100g}g | 
                    C: {ingredient.carbs_per_100g}g | F: {ingredient.fats_per_100g}g
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAddFromSearch(ingredient)}
                  className="ml-2"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
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

      <EditIngredientDialog
        isOpen={showEditIngredient}
        onClose={() => setShowEditIngredient(false)}
        ingredient={selectedIngredient}
        onIngredientUpdated={onIngredientAdded}
      />
    </div>
  );
}
