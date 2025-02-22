
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Search } from 'lucide-react';

type IngredientSearchProps = {
  mealId: string;
  searchTerm: string;
  quantity: number;
  isOptional: boolean;
  searchResults: Array<{
    id: string;
    name: string;
    calories_per_100g: number;
  }>;
  onSearchChange: (term: string) => void;
  onQuantityChange: (quantity: number) => void;
  onOptionalChange: (optional: boolean) => void;
  onIngredientSelect: (ingredient: any) => void;
};

export function IngredientSearch({
  mealId,
  searchTerm,
  quantity,
  isOptional,
  searchResults,
  onSearchChange,
  onQuantityChange,
  onOptionalChange,
  onIngredientSelect,
}: IngredientSearchProps) {
  return (
    <div className="space-y-4 border rounded-lg p-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor={`search-${mealId}`}>Search Ingredients</Label>
          <div className="relative">
            <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id={`search-${mealId}`}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
              placeholder="Search ingredients..."
            />
          </div>
        </div>
        <div className="w-24">
          <Label htmlFor={`quantity-${mealId}`}>Grams</Label>
          <Input
            id={`quantity-${mealId}`}
            type="number"
            value={quantity}
            onChange={(e) => onQuantityChange(Number(e.target.value))}
            min="0"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id={`optional-new-${mealId}`}
          checked={isOptional}
          onCheckedChange={(checked) => onOptionalChange(checked === true)}
        />
        <Label htmlFor={`optional-new-${mealId}`}>Mark as optional ingredient</Label>
      </div>
      
      {searchResults.length > 0 && (
        <div className="max-h-[200px] overflow-y-auto space-y-2">
          {searchResults.map((ingredient) => (
            <Button
              key={ingredient.id}
              type="button"
              variant="outline"
              className="w-full justify-between"
              onClick={() => onIngredientSelect(ingredient)}
            >
              <span>{ingredient.name}</span>
              <span>{ingredient.calories_per_100g} cal/100g</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
