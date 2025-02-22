
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type MealItem = {
  id: string;
  name: string;
  quantity: string;
  unit: string;
};

type Meal = {
  id: string;
  name: string;
  items: MealItem[];
};

export default function CreateNutritionPlan() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [meals, setMeals] = useState<Meal[]>([
    { id: '1', name: 'Breakfast', items: [] },
    { id: '2', name: 'Lunch', items: [] },
    { id: '3', name: 'Dinner', items: [] }
  ]);

  const addMealItem = (mealId: string) => {
    setMeals(meals.map(meal => {
      if (meal.id === mealId) {
        return {
          ...meal,
          items: [...meal.items, {
            id: Math.random().toString(),
            name: '',
            quantity: '',
            unit: 'g'
          }]
        };
      }
      return meal;
    }));
  };

  const updateMealItem = (mealId: string, itemId: string, field: keyof MealItem, value: string) => {
    setMeals(meals.map(meal => {
      if (meal.id === mealId) {
        return {
          ...meal,
          items: meal.items.map(item => {
            if (item.id === itemId) {
              return { ...item, [field]: value };
            }
            return item;
          })
        };
      }
      return meal;
    }));
  };

  const removeMealItem = (mealId: string, itemId: string) => {
    setMeals(meals.map(meal => {
      if (meal.id === mealId) {
        return {
          ...meal,
          items: meal.items.filter(item => item.id !== itemId)
        };
      }
      return meal;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create a nutrition plan",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('nutrition_plan_templates')
        .insert([
          {
            title,
            description,
            meals,
            coach_id: user.id,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Nutrition plan created successfully",
      });

      navigate('/nutrition-and-training');
    } catch (error) {
      console.error('Error creating nutrition plan:', error);
      toast({
        title: "Error",
        description: "Failed to create nutrition plan",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => navigate('/nutrition-and-training')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Nutrition Plans
        </Button>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold">Create New Nutrition Plan</h1>
            
            <div>
              <Label htmlFor="title">Plan Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter plan title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter plan description"
                className="min-h-[100px]"
              />
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-medium">Meals</h2>
            {meals.map((meal) => (
              <div key={meal.id} className="bg-card rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-medium">{meal.name}</h3>
                
                {meal.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Input
                        value={item.name}
                        onChange={(e) => updateMealItem(meal.id, item.id, 'name', e.target.value)}
                        placeholder="Food item"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateMealItem(meal.id, item.id, 'quantity', e.target.value)}
                        placeholder="Qty"
                        className="w-20"
                      />
                      <Input
                        value={item.unit}
                        onChange={(e) => updateMealItem(meal.id, item.id, 'unit', e.target.value)}
                        placeholder="Unit"
                        className="w-20"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeMealItem(meal.id, item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addMealItem(meal.id)}
                >
                  Add Item
                </Button>
              </div>
            ))}
          </div>

          <Button type="submit">Create Nutrition Plan</Button>
        </form>
      </div>
    </div>
  );
}
