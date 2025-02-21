
import { Button } from "@/components/ui/button";
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
    <div className="bg-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Training Plans</h2>
        <Button 
          onClick={handleAddTrainingPlan}
          className="bg-[#a7cca4] hover:bg-[#96bb93] text-white font-medium"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Plan
        </Button>
      </div>
      <p className="text-gray-600 mb-6">
        Create and manage workout plans for your clients here.
      </p>
      <div className="text-center py-12 text-gray-500">
        No training plans created yet.
      </div>
    </div>
  );
}
