import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Send, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

type NutritionPlan = {
  id: string;
  title: string;
  coach_id: string;
  created_at: string;
  updated_at: string;
  meals: any[];
};

type Client = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
};

export default function NutritionPlans() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
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
        
        if (profile?.role === 'coach') {
          fetchNutritionPlans(user.id);
          fetchClients(user.id);
        }
      } catch (error) {
        console.error("Error in fetchUserRole:", error);
      }
    };

    fetchUserRole();
  }, []);

  const fetchNutritionPlans = async (coachId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('nutrition_plan_templates')
        .select('*')
        .eq('coach_id', coachId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNutritionPlans(data || []);
    } catch (error) {
      console.error("Error fetching nutrition plans:", error);
      toast({
        title: "Error",
        description: "Failed to load nutrition plans",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClients = async (coachId: string) => {
    try {
      const { data, error } = await supabase
        .from('coach_clients')
        .select(`
          client_id,
          client:client_id (
            id,
            email,
            first_name,
            last_name
          )
        `)
        .eq('coach_id', coachId);

      if (error) throw error;
      
      const clientsList = data.map(item => ({
        id: item.client.id,
        email: item.client.email,
        first_name: item.client.first_name,
        last_name: item.client.last_name
      }));
      
      setClients(clientsList);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const handleAddNutritionPlan = () => {
    window.location.href = "/nutrition-and-training/create-nutrition-plan";
  };

  const handleSendToClient = (planId: string) => {
    setSelectedPlanId(planId);
    setIsDialogOpen(true);
  };

  const assignPlanToClient = async (clientId: string) => {
    if (!selectedPlanId) return;
    
    setIsAssigning(true);
    try {
      const { error } = await supabase
        .from('client_nutrition_plans')
        .insert([
          {
            client_id: clientId,
            nutrition_plan_id: selectedPlanId,
            assigned_at: new Date().toISOString(),
            status: 'active'
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Nutrition plan assigned to client successfully",
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error assigning plan to client:", error);
      toast({
        title: "Error",
        description: "Failed to assign nutrition plan to client",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
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
              
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-5 w-40" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : nutritionPlans.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No nutrition plans created yet.
                </p>
              ) : (
                <div className="grid gap-4">
                  {nutritionPlans.map((plan) => (
                    <Card key={plan.id} className="overflow-hidden">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                          <CardTitle>{plan.title}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <CalendarIcon className="h-3 w-3" />
                            {format(new Date(plan.created_at), "yyyy-MM-dd")}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSendToClient(plan.id)}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Send to Client
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {plan.meals?.length || 0} meals
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Nutrition Plan to Client</DialogTitle>
            <DialogDescription>
              Select a client to assign this nutrition plan to.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {clients.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No clients found. Add clients first.
              </p>
            ) : (
              <div className="grid gap-2">
                {clients.map((client) => (
                  <Card 
                    key={client.id} 
                    className="cursor-pointer hover:bg-accent/10"
                    onClick={() => !isAssigning && assignPlanToClient(client.id)}
                  >
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{client.first_name} {client.last_name}</p>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        disabled={isAssigning}
                      >
                        Select
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
