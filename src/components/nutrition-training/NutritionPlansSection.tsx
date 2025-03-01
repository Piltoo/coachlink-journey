
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, SendIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { ClientSelect } from "@/components/nutrition-training/training-plan/ClientSelect";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type NutritionTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
};

export function NutritionPlansSection() {
  const navigate = useNavigate();
  const [nutritionPlans, setNutritionPlans] = useState<any[]>([]);
  const [clients, setClients] = useState<Array<{ id: string; full_name: string }>>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchNutritionPlans = async () => {
    try {
      console.log("Starting to fetch nutrition plans...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user found");
        return;
      }

      // Verify coach role
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        throw profileError;
      }

      if (!userProfile || userProfile.role !== 'coach') {
        console.error("Access denied: User is not a coach");
        toast({
          title: "Access Denied",
          description: "Only coaches can access nutrition plan templates",
          variant: "destructive",
        });
        return;
      }

      // Get nutrition plan templates
      const { data: templates, error } = await supabase
        .from('nutrition_plan_templates')
        .select('*')
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching nutrition plans:", error);
        throw error;
      }

      console.log("Fetched nutrition plans:", templates);
      
      // Parse the meals JSON data
      const plansWithMeals = templates.map(template => ({
        ...template,
        meals: template.meals || []
      }));

      setNutritionPlans(plansWithMeals);
    } catch (error) {
      console.error('Error fetching nutrition plans:', error);
      toast({
        title: "Error",
        description: "Failed to load nutrition plans",
        variant: "destructive",
      });
    }
  };

  const fetchClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('coach_clients')
        .select('client_id, profiles:client_id(id, full_name)')
        .eq('coach_id', user.id)
        .eq('status', 'active');

      if (error) throw error;

      const formattedClients = data.map((item: any) => ({
        id: item.profiles.id,
        full_name: item.profiles.full_name || 'Unnamed Client'
      }));

      setClients(formattedClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: "Failed to load clients",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchNutritionPlans();
    fetchClients();
  }, []);

  const calculateTotalNutrition = (meals: any[]): NutritionTotals => {
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
    };

    meals?.forEach((meal) => {
      meal.ingredients?.forEach((ingredient: any) => {
        const quantity = ingredient.quantity || 0;
        const multiplier = quantity / 100;
        const nutrition = ingredient.nutrition || {};

        totals.calories += (nutrition.calories || 0) * multiplier;
        totals.protein += (nutrition.protein || 0) * multiplier;
        totals.carbs += (nutrition.carbs || 0) * multiplier;
        totals.fats += (nutrition.fats || 0) * multiplier;
        totals.fiber += (nutrition.fiber || 0) * multiplier;
      });
    });

    return totals;
  };

  const handleEditPlan = (planId: string) => {
    navigate(`/nutrition-and-training/create-nutrition-plan/${planId}`);
  };

  const handleSendToClient = async () => {
    if (!selectedClientId || !activePlanId) {
      toast({
        title: "Error",
        description: "Please select a client",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const selectedPlan = nutritionPlans.find(plan => plan.id === activePlanId);
      if (!selectedPlan) throw new Error("Plan not found");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Create client nutrition plan entry
      const { error } = await supabase
        .from('client_nutrition_plans')
        .insert([
          { 
            client_id: selectedClientId,
            nutrition_plan_id: activePlanId,
            status: 'active',
            assigned_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Nutrition plan sent to client successfully",
      });

      // Reset selection and close sheet
      setSelectedClientId("");
      setActivePlanId(null);
    } catch (error: any) {
      console.error('Error sending plan to client:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send plan to client",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
        {nutritionPlans.map((plan) => {
          const totals = calculateTotalNutrition(plan.meals || []);
          
          return (
            <Card 
              key={plan.id} 
              className="cursor-pointer hover:bg-accent/5 transition-colors"
            >
              <CardHeader 
                className="cursor-pointer" 
                onClick={() => handleEditPlan(plan.id)}
              >
                <CardTitle>{plan.title}</CardTitle>
                <CardDescription>
                  Created on {new Date(plan.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent 
                className="cursor-pointer" 
                onClick={() => handleEditPlan(plan.id)}
              >
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {plan.description}
                </p>
                <Separator className="my-2" />
                <div className="grid grid-cols-3 gap-2 text-sm mt-2">
                  <div>
                    <p className="font-medium">{Math.round(totals.calories)}</p>
                    <p className="text-xs text-muted-foreground">Calories</p>
                  </div>
                  <div>
                    <p className="font-medium">{totals.protein.toFixed(1)}g</p>
                    <p className="text-xs text-muted-foreground">Protein</p>
                  </div>
                  <div>
                    <p className="font-medium">{totals.carbs.toFixed(1)}g</p>
                    <p className="text-xs text-muted-foreground">Carbs</p>
                  </div>
                  <div>
                    <p className="font-medium">{totals.fats.toFixed(1)}g</p>
                    <p className="text-xs text-muted-foreground">Fats</p>
                  </div>
                  <div>
                    <p className="font-medium">{totals.fiber.toFixed(1)}g</p>
                    <p className="text-xs text-muted-foreground">Fiber</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => {
                    setActivePlanId(plan.id);
                    setSelectedClientId("");
                  }}
                >
                  <SendIcon className="w-4 h-4 mr-2" />
                  Send to Client
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Sheet open={activePlanId !== null} onOpenChange={(open) => !open && setActivePlanId(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Send Nutrition Plan to Client</SheetTitle>
          </SheetHeader>
          <div className="py-6 space-y-6">
            <ClientSelect 
              clients={clients} 
              selectedClientId={selectedClientId} 
              onClientSelect={setSelectedClientId} 
            />
            
            <Button 
              className="w-full" 
              onClick={handleSendToClient}
              disabled={isLoading || !selectedClientId}
            >
              {isLoading ? "Sending..." : "Send Plan"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
