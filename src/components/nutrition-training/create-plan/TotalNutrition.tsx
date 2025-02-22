
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type NutritionTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
};

type TotalNutritionProps = {
  totals: NutritionTotals;
};

export function TotalNutrition({ totals }: TotalNutritionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Nutrition</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-4 text-center">
          <div>
            <div className="text-lg font-medium">{totals.calories.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Calories</div>
          </div>
          <div>
            <div className="text-lg font-medium">{totals.protein.toFixed(1)}g</div>
            <div className="text-sm text-muted-foreground">Protein</div>
          </div>
          <div>
            <div className="text-lg font-medium">{totals.carbs.toFixed(1)}g</div>
            <div className="text-sm text-muted-foreground">Carbs</div>
          </div>
          <div>
            <div className="text-lg font-medium">{totals.fats.toFixed(1)}g</div>
            <div className="text-sm text-muted-foreground">Fats</div>
          </div>
          <div>
            <div className="text-lg font-medium">{totals.fiber.toFixed(1)}g</div>
            <div className="text-sm text-muted-foreground">Fiber</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
