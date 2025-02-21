
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings2, Building2, CreditCard } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

type SubscriptionPlan = {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  currency: string;
  interval: string;
  active: boolean;
};

export default function Settings() {
  const [companyName, setCompanyName] = useState("FitCoach");
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    amount: 0,
    interval: "month",
  });

  useEffect(() => {
    const fetchUserAndSettings = async () => {
      console.log("Fetching user and settings...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No user found");
        return;
      }
      console.log("User found:", user.id);
      setUserId(user.id);

      // Fetch user role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return;
      }

      if (profile) {
        console.log("User role:", profile.role);
        setUserRole(profile.role);
      }

      // Fetch subscription plans
      const { data: subscriptionPlans, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('coach_id', user.id)
        .eq('active', true);

      if (plansError) {
        console.error("Error fetching subscription plans:", plansError);
        return;
      }

      setPlans(subscriptionPlans || []);
    };

    fetchUserAndSettings();
  }, []);

  const handleSaveCompanyName = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User not found. Please try logging in again.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('theme_preferences')
      .upsert({
        user_id: userId,
        company_name: companyName
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error saving company name:', error);
      toast({
        title: "Error",
        description: "Failed to save company name",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Company name saved successfully",
    });
  };

  const handleCreatePlan = async () => {
    // This is a placeholder - we'll implement Stripe integration in the next step
    toast({
      title: "Coming Soon",
      description: "Subscription plan creation will be available once Stripe is integrated.",
    });
  };

  if (userRole !== 'coach') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50 flex items-center justify-center">
        <Card className="p-6 bg-white/40 backdrop-blur-lg border border-green-100">
          <h2 className="text-xl font-semibold text-primary mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">Only coaches can access the settings page.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Settings2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">Settings</h1>
          </div>

          <Card className="p-6 bg-white/40 backdrop-blur-lg border border-green-100">
            <Tabs defaultValue="branding">
              <TabsList className="mb-4">
                <TabsTrigger value="branding" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Branding
                </TabsTrigger>
                <TabsTrigger value="subscriptions" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Subscription Plans
                </TabsTrigger>
              </TabsList>

              <TabsContent value="branding" className="space-y-6">
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter your company name"
                      className="max-w-md"
                    />
                  </div>
                  <Button onClick={handleSaveCompanyName} className="w-full sm:w-auto">
                    Save Company Name
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="subscriptions" className="space-y-6">
                <div className="grid gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Create New Plan</h3>
                    <div className="space-y-2">
                      <Label htmlFor="plan-name">Plan Name</Label>
                      <Input
                        id="plan-name"
                        value={newPlan.name}
                        onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                        placeholder="e.g., Basic Monthly, Premium Annual"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="plan-description">Description</Label>
                      <Textarea
                        id="plan-description"
                        value={newPlan.description}
                        onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                        placeholder="Describe what's included in this plan"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="plan-amount">Amount (USD)</Label>
                      <Input
                        id="plan-amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={newPlan.amount}
                        onChange={(e) => setNewPlan({ ...newPlan, amount: parseFloat(e.target.value) })}
                        placeholder="0.00"
                      />
                    </div>
                    <Button onClick={handleCreatePlan} className="w-full sm:w-auto">
                      Create Plan
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Existing Plans</h3>
                    <div className="grid gap-4">
                      {plans.map((plan) => (
                        <Card key={plan.id} className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{plan.name}</h4>
                              <p className="text-sm text-muted-foreground">{plan.description}</p>
                              <p className="text-sm font-medium mt-2">
                                ${plan.amount} / {plan.interval}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                      {plans.length === 0 && (
                        <p className="text-muted-foreground">No subscription plans created yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
