
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export type SearchIngredient = {
  name: string;
  calories_per_100g: number;
  protein_per_100g: string;
  carbs_per_100g: string;
  fats_per_100g: string;
  fibers_per_100g: string;
};

type IngredientSearchProps = {
  onIngredientAdded: () => void;
};

export function IngredientSearch({ onIngredientAdded }: IngredientSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchIngredient[]>([]);
  const { toast } = useToast();

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

  return (
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
  );
}
