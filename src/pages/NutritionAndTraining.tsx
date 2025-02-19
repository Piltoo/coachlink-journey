
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const NutritionAndTraining = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        });
        return;
      }

      setUserRole(profile.role);
    };

    fetchUserRole();
  }, []);

  const handleAddTrainingPlan = () => {
    // TODO: Implement add training plan functionality
    toast({
      title: "Coming Soon",
      description: "Adding new training plans will be available soon.",
    });
  };

  const handleAddNutritionPlan = () => {
    // TODO: Implement add nutrition plan functionality
    toast({
      title: "Coming Soon",
      description: "Adding new nutrition plans will be available soon.",
    });
  };

  if (userRole !== 'trainer') {
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
          <h1 className="text-3xl font-bold text-primary">Nutrition & Training Plans</h1>
          
          <Tabs defaultValue="training" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="training">Training Plans</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition Plans</TabsTrigger>
            </TabsList>
            
            <TabsContent value="training" className="mt-6">
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
                    {/* Training plans will be listed here */}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="nutrition" className="mt-6">
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
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default NutritionAndTraining;
