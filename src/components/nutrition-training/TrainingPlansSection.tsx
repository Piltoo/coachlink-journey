
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function TrainingPlansSection() {
  const { toast } = useToast();

  const handleAddTrainingPlan = () => {
    toast({
      title: "Coming Soon",
      description: "Adding new training plans will be available soon.",
    });
  };

  return (
    <Card className="bg-white/40 backdrop-blur-lg border border-green-100">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Training Plans</CardTitle>
        <Button 
          onClick={handleAddTrainingPlan}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Plan
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Create and manage workout plans for your clients here.
        </p>
        <div className="grid gap-4">
          <p className="text-muted-foreground text-center py-4">
            No training plans created yet.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
