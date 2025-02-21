
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function NutritionPlansSection() {
  const { toast } = useToast();

  const handleAddNutritionPlan = () => {
    toast({
      title: "Coming Soon",
      description: "Adding new nutrition plans will be available soon.",
    });
  };

  return (
    <Card className="bg-white/40 backdrop-blur-lg border border-green-100">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Nutrition Plans</CardTitle>
        <Button 
          onClick={handleAddNutritionPlan}
          className="bg-[#95D5B2] hover:bg-[#74C69D] text-[#1B4332]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Plan
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Create and manage nutrition plans for your clients here.
        </p>
        <div className="grid gap-4">
          <p className="text-muted-foreground text-center py-4">
            No nutrition plans created yet.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
