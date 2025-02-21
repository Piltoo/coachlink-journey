
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CreateNutritionPlanDialog } from "./CreateNutritionPlanDialog";

export function NutritionPlansSection() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  const handlePlanCreated = () => {
    toast({
      title: "Success",
      description: "New nutrition plan has been created.",
    });
  };

  return (
    <div className="bg-white/40 backdrop-blur-lg rounded-lg border border-gray-200/50 p-6 shadow-sm transition-all duration-200 ease-in-out">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Nutrition Plans</h2>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="bg-[#a7cca4] hover:bg-[#96bb93] text-white font-medium"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Plan
        </Button>
      </div>

      <div className="text-center py-12 text-gray-500">
        No nutrition plans created yet.
      </div>

      <CreateNutritionPlanDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onPlanCreated={handlePlanCreated}
      />
    </div>
  );
}
