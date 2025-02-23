
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { MealCard } from './MealCard';
import { Meal } from '@/hooks/use-nutrition-plan';
import { Ingredient } from '@/components/nutrition-training/types';

type MealManagerProps = {
  meals: Meal[];
  searchTerms: { [key: string]: string };
  searchResults: { [key: string]: Ingredient[] };
  quantities: { [key: string]: number };
  isOptional: { [key: string]: boolean };
  onAddMeal: () => void;
  onMealNameChange: (mealId: string, name: string) => void;
  onSearchChange: (mealId: string, term: string) => void;
  onQuantityChange: (mealId: string, quantity: number) => void;
  onOptionalChange: (mealId: string, optional: boolean) => void;
  onIngredientSelect: (mealId: string, ingredient: Ingredient) => void;
  onItemQuantityChange: (mealId: string, itemId: string, quantity: number) => void;
  onItemOptionalToggle: (mealId: string, itemId: string) => void;
  onItemRemove: (mealId: string, itemId: string) => void;
};

export function MealManager({
  meals,
  searchTerms,
  searchResults,
  quantities,
  isOptional,
  onAddMeal,
  onMealNameChange,
  onSearchChange,
  onQuantityChange,
  onOptionalChange,
  onIngredientSelect,
  onItemQuantityChange,
  onItemOptionalToggle,
  onItemRemove,
}: MealManagerProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Meals</h2>
        <Button 
          type="button"
          onClick={onAddMeal}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Meal
        </Button>
      </div>

      {meals.map((meal) => (
        <MealCard
          key={meal.id}
          meal={meal}
          searchTerm={searchTerms[meal.id] || ''}
          searchResults={searchResults[meal.id] || []}
          quantity={quantities[meal.id] || 100}
          isOptional={isOptional[meal.id] || false}
          onMealNameChange={(name) => onMealNameChange(meal.id, name)}
          onSearchChange={(term) => onSearchChange(meal.id, term)}
          onQuantityChange={(quantity) => onQuantityChange(meal.id, quantity)}
          onOptionalChange={(optional) => onOptionalChange(meal.id, optional)}
          onIngredientSelect={(ingredient) => onIngredientSelect(meal.id, ingredient)}
          onItemQuantityChange={(itemId, quantity) => onItemQuantityChange(meal.id, itemId, quantity)}
          onItemOptionalToggle={(itemId) => onItemOptionalToggle(meal.id, itemId)}
          onItemRemove={(itemId) => onItemRemove(meal.id, itemId)}
        />
      ))}
    </div>
  );
}
