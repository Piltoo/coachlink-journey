
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Meal = {
  id: string;
  name: string;
  items: {
    id: string;
    name: string;
    quantity: string;
    unit: string;
  }[];
};

export default function CreateNutritionPlan() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [meals, setMeals] = useState<Meal[]>([]);

  const handleAddMeal = () => {
    const newMeal: Meal = {
      id: Math.random().toString(),
      name: `Meal ${meals.length + 1}`,
      items: []
    };
    setMeals([...meals, newMeal]);
  };

  const handleUpdateMealName = (mealId: string, newName: string) => {
    setMeals(meals.map(meal => 
      meal.id === mealId ? { ...meal, name: newName } : meal
    ));
  };

  const handleAddMealItem = (mealId: string) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a plan title",
        variant: "destructive",
      });
      return;
    }

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
            coach_id: user.id,
            meals: meals,
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
          <Card>
            <CardHeader>
              <CardTitle>Create New Nutrition Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-medium">Meals</h2>
              <Button 
                type="button"
                onClick={handleAddMeal}
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Meal
              </Button>
            </div>

            {meals.map((meal) => (
              <Card key={meal.id} className="bg-card">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <Input
                      value={meal.name}
                      onChange={(e) => handleUpdateMealName(meal.id, e.target.value)}
                      placeholder="Meal name"
                      className="font-medium"
                    />
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleAddMealItem(meal.id)}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Food Item
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button type="submit" disabled={!title.trim() || meals.length === 0}>
            Create Nutrition Plan
          </Button>
        </form>
      </div>
    </div>
  );
}
