
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TrainingPlansSection } from "./TrainingPlansSection";
import { NutritionPlansSection } from "./NutritionPlansSection";
import { IngredientsSection } from "./IngredientsSection";
import { ExercisesSection } from "./ExercisesSection";
import { Exercise, Ingredient } from "./types/nutrition-training";

interface NavigationTabsProps {
  ingredients: Ingredient[];
  exercises: Exercise[];
  onIngredientAdded: () => void;
  onExerciseChange: () => void;
}

export function NavigationTabs({ 
  ingredients, 
  exercises, 
  onIngredientAdded, 
  onExerciseChange 
}: NavigationTabsProps) {
  return (
    <Tabs defaultValue="training" className="space-y-6">
      <TabsList className="w-full flex border-b border-gray-200 bg-transparent p-0 space-x-8">
        <TabsTrigger 
          value="training"
          className="px-1 py-4 text-sm font-medium text-gray-500 border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:text-gray-900 rounded-none relative focus-visible:outline-none"
        >
          Training Plans
        </TabsTrigger>
        <TabsTrigger 
          value="nutrition"
          className="px-1 py-4 text-sm font-medium text-gray-500 border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:text-gray-900 rounded-none relative focus-visible:outline-none"
        >
          Nutrition Plans
        </TabsTrigger>
        <TabsTrigger 
          value="ingredients"
          className="px-1 py-4 text-sm font-medium text-gray-500 border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:text-gray-900 rounded-none relative focus-visible:outline-none"
        >
          Ingredients List
        </TabsTrigger>
        <TabsTrigger 
          value="exercises"
          className="px-1 py-4 text-sm font-medium text-gray-500 border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:text-gray-900 rounded-none relative focus-visible:outline-none"
        >
          Exercise Library
        </TabsTrigger>
      </TabsList>

      <TabsContent value="training" className="mt-6">
        <TrainingPlansSection />
      </TabsContent>

      <TabsContent value="nutrition" className="mt-6">
        <NutritionPlansSection />
      </TabsContent>

      <TabsContent value="ingredients" className="mt-6">
        <IngredientsSection 
          ingredients={ingredients} 
          onIngredientAdded={onIngredientAdded}
        />
      </TabsContent>

      <TabsContent value="exercises" className="mt-6">
        <ExercisesSection 
          exercises={exercises}
          onExerciseChange={onExerciseChange}
        />
      </TabsContent>
    </Tabs>
  );
}
