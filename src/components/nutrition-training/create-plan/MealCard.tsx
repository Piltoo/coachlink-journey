
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MealItem } from './MealItem';
import { IngredientSearch } from './IngredientSearch';
import { Ingredient, MealItem as MealItemType } from '../types/nutrition-training';

type MealCardProps = {
  meal: {
    id: string;
    name: string;
    items: MealItemType[];
  };
  searchTerm: string;
  searchResults: Ingredient[];
  quantity: number;
  isOptional: boolean;
  onMealNameChange: (name: string) => void;
  onSearchChange: (term: string) => void;
  onQuantityChange: (quantity: number) => void;
  onOptionalChange: (optional: boolean) => void;
  onIngredientSelect: (ingredient: Ingredient) => void;
  onItemQuantityChange: (itemId: string, quantity: number) => void;
  onItemOptionalToggle: (itemId: string) => void;
  onItemRemove: (itemId: string) => void;
};

export function MealCard({
  meal,
  searchTerm,
  searchResults,
  quantity,
  isOptional,
  onMealNameChange,
  onSearchChange,
  onQuantityChange,
  onOptionalChange,
  onIngredientSelect,
  onItemQuantityChange,
  onItemOptionalToggle,
  onItemRemove,
}: MealCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <Input
            value={meal.name}
            onChange={(e) => onMealNameChange(e.target.value)}
            placeholder="Meal name"
            className="font-medium"
          />
          
          {meal.items.map((item) => (
            <MealItem
              key={item.id}
              item={item}
              onQuantityChange={(newQuantity) => onItemQuantityChange(item.id, newQuantity)}
              onOptionalToggle={() => onItemOptionalToggle(item.id)}
              onRemove={() => onItemRemove(item.id)}
            />
          ))}

          <IngredientSearch
            mealId={meal.id}
            searchTerm={searchTerm}
            quantity={quantity}
            isOptional={isOptional}
            searchResults={searchResults}
            onSearchChange={onSearchChange}
            onQuantityChange={onQuantityChange}
            onOptionalChange={onOptionalChange}
            onIngredientSelect={onIngredientSelect}
          />
        </div>
      </CardContent>
    </Card>
  );
}
