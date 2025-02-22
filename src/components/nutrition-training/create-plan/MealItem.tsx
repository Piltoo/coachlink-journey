
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';

type MealItemProps = {
  item: {
    id: string;
    name: string;
    quantity: number;
    optional: boolean;
    nutrition: {
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
      fiber: number;
    };
  };
  onQuantityChange: (newQuantity: number) => void;
  onOptionalToggle: () => void;
  onRemove: () => void;
};

export function MealItem({ item, onQuantityChange, onOptionalToggle, onRemove }: MealItemProps) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">{item.name}</span>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id={`optional-${item.id}`}
              checked={item.optional}
              onCheckedChange={onOptionalToggle}
            />
            <Label htmlFor={`optional-${item.id}`} className="text-sm text-muted-foreground">
              Optional
            </Label>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={item.quantity}
            onChange={(e) => onQuantityChange(Number(e.target.value))}
            className="w-20"
            min="0"
          />
          <span className="text-sm text-muted-foreground">g</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="text-sm text-muted-foreground grid grid-cols-5 gap-2">
        <div>Calories: {item.nutrition.calories.toFixed(1)}</div>
        <div>Protein: {item.nutrition.protein.toFixed(1)}g</div>
        <div>Carbs: {item.nutrition.carbs.toFixed(1)}g</div>
        <div>Fats: {item.nutrition.fats.toFixed(1)}g</div>
        <div>Fiber: {item.nutrition.fiber.toFixed(1)}g</div>
      </div>
    </div>
  );
}
