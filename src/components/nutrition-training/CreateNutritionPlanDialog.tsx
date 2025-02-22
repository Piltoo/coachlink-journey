
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CreateNutritionPlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanCreated: () => void;
  planToEdit?: {
    id: string;
    title: string;
    description: string | null;
    meals?: any[];
  };
}

export function CreateNutritionPlanDialog({
  isOpen,
  onClose,
  onPlanCreated,
  planToEdit
}: CreateNutritionPlanDialogProps) {
  const [formData, setFormData] = useState({
    title: planToEdit?.title || "",
    description: planToEdit?.description || "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (planToEdit) {
        // Update existing plan
        const { error } = await supabase
          .from('nutrition_plan_templates')
          .update({
            title: formData.title,
            description: formData.description,
            updated_at: new Date().toISOString()
          })
          .eq('id', planToEdit.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Nutrition plan updated successfully",
        });
      } else {
        // Create new plan
        const { error } = await supabase
          .from('nutrition_plan_templates')
          .insert([
            {
              title: formData.title,
              description: formData.description,
              coach_id: user.id,
            }
          ]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Nutrition plan created successfully",
        });
      }

      onPlanCreated();
      onClose();
      setFormData({ title: "", description: "" });
    } catch (error) {
      console.error('Error saving nutrition plan:', error);
      toast({
        title: "Error",
        description: "Failed to save nutrition plan",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{planToEdit ? 'Edit Nutrition Plan' : 'Create New Nutrition Plan'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter plan title"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter plan description"
              className="min-h-[100px]"
            />
          </div>
          <Button type="submit">{planToEdit ? 'Update Plan' : 'Create Plan'}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
