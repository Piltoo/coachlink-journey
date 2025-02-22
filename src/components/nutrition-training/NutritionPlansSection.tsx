
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export function NutritionPlansSection() {
  const navigate = useNavigate();
  const [nutritionPlans, setNutritionPlans] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchNutritionPlans = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('nutrition_plan_templates')
        .select('*')
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNutritionPlans(data || []);
    } catch (error) {
      console.error('Error fetching nutrition plans:', error);
      toast({
        title: "Error",
        description: "Failed to load nutrition plans",
        variant: "destructive",
      });
    }
  };

  // Fetch nutrition plans when component mounts
  useState(() => {
    fetchNutritionPlans();
  }, []);

  const handleEditPlan = (planId: string) => {
    navigate(`/nutrition-and-training/create-nutrition-plan/${planId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Nutrition Plans</h2>
        <Button onClick={() => navigate("/nutrition-and-training/create-nutrition-plan")}>
          <Plus className="w-4 h-4 mr-2" />
          Create Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {nutritionPlans.map((plan) => (
          <Card 
            key={plan.id} 
            className="cursor-pointer hover:bg-accent/5 transition-colors"
            onClick={() => handleEditPlan(plan.id)}
          >
            <CardHeader>
              <CardTitle>{plan.title}</CardTitle>
              <CardDescription>
                Created on {new Date(plan.created_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {plan.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
