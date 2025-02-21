
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function NutritionPlans() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          return;
        }

        setUserRole(profile?.role);
      } catch (error) {
        console.error("Error in fetchUserRole:", error);
      }
    };

    fetchUserRole();
  }, []);

  const handleAddNutritionPlan = () => {
    toast({
      title: "Coming Soon",
      description: "Adding new nutrition plans will be available soon.",
    });
  };

  if (userRole !== 'coach') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-white/40 backdrop-blur-lg border border-red-100">
            <CardContent className="pt-6">
              <p className="text-center text-red-600">
                You don't have permission to access this page.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-primary">Nutrition Plans</h1>
          
          <Card className="bg-white/40 backdrop-blur-lg border border-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Nutrition Plans</CardTitle>
              <Button 
                onClick={handleAddNutritionPlan}
                className="bg-green-600 hover:bg-green-700"
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
                {/* Nutrition plans will be listed here */}
                <p className="text-muted-foreground text-center py-4">
                  No nutrition plans created yet.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
