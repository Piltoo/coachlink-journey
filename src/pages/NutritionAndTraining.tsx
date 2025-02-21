
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type Ingredient = {
  id: string;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
};

const NutritionAndTraining = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    calories_per_100g: "",
    protein_per_100g: "",
    carbs_per_100g: "",
    fats_per_100g: "",
  });
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
          toast({
            title: "Error",
            description: "Failed to load user profile",
            variant: "destructive",
          });
          return;
        }

        setUserRole(profile?.role);
      } catch (error) {
        console.error("Error in fetchUserRole:", error);
        toast({
          title: "Error",
          description: "Failed to check user permissions",
          variant: "destructive",
        });
      }
    };

    fetchUserRole();
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('name');

      if (error) throw error;
      setIngredients(data);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
      toast({
        title: "Error",
        description: "Failed to load ingredients",
        variant: "destructive",
      });
    }
  };

  const handleAddIngredient = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const ingredientData = {
        name: newIngredient.name,
        calories_per_100g: parseFloat(newIngredient.calories_per_100g),
        protein_per_100g: parseFloat(newIngredient.protein_per_100g),
        carbs_per_100g: parseFloat(newIngredient.carbs_per_100g),
        fats_per_100g: parseFloat(newIngredient.fats_per_100g),
        coach_id: user.id,
      };

      const { error } = await supabase
        .from('ingredients')
        .insert([ingredientData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ingredient added successfully",
      });

      setShowAddIngredient(false);
      setNewIngredient({
        name: "",
        calories_per_100g: "",
        protein_per_100g: "",
        carbs_per_100g: "",
        fats_per_100g: "",
      });
      fetchIngredients();
    } catch (error) {
      console.error("Error adding ingredient:", error);
      toast({
        title: "Error",
        description: "Failed to add ingredient",
        variant: "destructive",
      });
    }
  };

  const handleAddTrainingPlan = () => {
    toast({
      title: "Coming Soon",
      description: "Adding new training plans will be available soon.",
    });
  };

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
          <h1 className="text-3xl font-bold text-primary">Nutrition & Training Plans</h1>
          
          <Tabs defaultValue="nutrition" className="w-full">
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
            
            <TabsContent value="nutrition" className="mt-6 space-y-6">
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

              <Card className="bg-white/40 backdrop-blur-lg border border-green-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>Ingredients Database</CardTitle>
                  <Dialog open={showAddIngredient} onOpenChange={setShowAddIngredient}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Ingredient
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add New Ingredient</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={newIngredient.name}
                            onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                            placeholder="Enter ingredient name"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="calories">Calories per 100g</Label>
                            <Input
                              id="calories"
                              type="number"
                              value={newIngredient.calories_per_100g}
                              onChange={(e) => setNewIngredient({ ...newIngredient, calories_per_100g: e.target.value })}
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="protein">Protein (g)</Label>
                            <Input
                              id="protein"
                              type="number"
                              value={newIngredient.protein_per_100g}
                              onChange={(e) => setNewIngredient({ ...newIngredient, protein_per_100g: e.target.value })}
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="carbs">Carbs (g)</Label>
                            <Input
                              id="carbs"
                              type="number"
                              value={newIngredient.carbs_per_100g}
                              onChange={(e) => setNewIngredient({ ...newIngredient, carbs_per_100g: e.target.value })}
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="fats">Fats (g)</Label>
                            <Input
                              id="fats"
                              type="number"
                              value={newIngredient.fats_per_100g}
                              onChange={(e) => setNewIngredient({ ...newIngredient, fats_per_100g: e.target.value })}
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <Button onClick={handleAddIngredient} className="w-full">
                          Add Ingredient
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {ingredients.map((ingredient) => (
                      <div key={ingredient.id} className="flex justify-between items-center p-4 border rounded-lg bg-white/60">
                        <div>
                          <h4 className="font-medium">{ingredient.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Per 100g: {ingredient.calories_per_100g} cal | P: {ingredient.protein_per_100g}g | 
                            C: {ingredient.carbs_per_100g}g | F: {ingredient.fats_per_100g}g
                          </p>
                        </div>
                      </div>
                    ))}
                    {ingredients.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">
                        No ingredients added yet. Start building your database by adding ingredients.
                      </p>
                    )}
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
