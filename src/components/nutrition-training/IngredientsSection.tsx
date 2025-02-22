
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AddIngredientDialog } from "./AddIngredientDialog";
import { EditIngredientDialog } from "./EditIngredientDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Ingredient } from "./types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil } from "lucide-react";

type IngredientsSectionProps = {
  ingredients: Ingredient[];
  onIngredientAdded: () => void;
};

export function IngredientsSection({ ingredients, onIngredientAdded }: IngredientsSectionProps) {
  const [showEditIngredient, setShowEditIngredient] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [groups, setGroups] = useState<string[]>([]);

  useEffect(() => {
    const uniqueGroups = Array.from(new Set(
      ingredients
        .map(ingredient => ingredient.group_name)
        .filter((group): group is string => 
          Boolean(group) && group.trim() !== ''
        )
    )).sort();

    setGroups(uniqueGroups);
  }, [ingredients]);

  const handleEditClick = (ingredient: Ingredient, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    setSelectedIngredient(ingredient);
    setShowEditIngredient(true);
  };

  const handleCloseDialog = () => {
    setShowEditIngredient(false);
    setSelectedIngredient(null);
    onIngredientAdded(); // Refresh the list after closing dialog
  };

  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroup === "all" || ingredient.group_name === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="bg-white/40 backdrop-blur-lg rounded-lg border border-gray-200/50 p-6 shadow-sm transition-all duration-200 ease-in-out">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Ingredients List</h2>
        <AddIngredientDialog groups={groups} onIngredientAdded={onIngredientAdded} />
      </div>

      <div className="space-y-6">
        <Input
          type="text"
          placeholder="Search ingredients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />

        <Tabs defaultValue="all" value={selectedGroup} onValueChange={setSelectedGroup}>
          <TabsList className="w-full flex flex-wrap">
            <TabsTrigger value="all" className="flex-1">
              All
            </TabsTrigger>
            {groups.map((group) => (
              <TabsTrigger key={group} value={group} className="flex-1">
                {group}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          {filteredIngredients.length > 0 ? (
            filteredIngredients.map((ingredient) => (
              <div 
                key={ingredient.id} 
                className="p-4 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg transition-all duration-200 ease-in-out hover:bg-white/80"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{ingredient.name}</h3>
                    <p className="text-sm text-gray-500">{ingredient.group_name}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-500">
                      Per 100g: {ingredient.calories_per_100g} cal | P: {ingredient.protein_per_100g}g | 
                      C: {ingredient.carbs_per_100g}g | F: {ingredient.fats_per_100g}g | Fiber: {ingredient.fiber_per_100g}g
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => handleEditClick(ingredient, e)}
                      className="ml-2"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit {ingredient.name}</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              No ingredients found.
            </div>
          )}
        </div>
      </div>

      {selectedIngredient && (
        <EditIngredientDialog
          isOpen={showEditIngredient}
          onClose={handleCloseDialog}
          ingredient={selectedIngredient}
          onIngredientUpdated={handleCloseDialog}
          groups={groups}
        />
      )}
    </div>
  );
}
