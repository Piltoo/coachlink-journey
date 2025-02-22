
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { SubscriptionPlan, NewPlan } from "./types";

export function SubscriptionSettings() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [newPlan, setNewPlan] = useState<NewPlan>({
    name: "",
    description: "",
    amount: 0,
    interval: "month",
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchPlans = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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

    fetchPlans();
  }, []);

  const handleCreatePlan = async () => {
    // This is a placeholder - we'll implement Stripe integration in the next step
    toast({
      title: "Coming Soon",
      description: "Subscription plan creation will be available once Stripe is integrated.",
    });
  };

  return (
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
  );
}
