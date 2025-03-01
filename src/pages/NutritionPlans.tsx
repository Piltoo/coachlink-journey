import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Meal } from '@/hooks/use-nutrition-plan';

type Client = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
};

type NutritionPlan = {
  id: string;
  title: string;
  description: string;
  meals: Meal[];
  coach_id: string;
  created_at: string;
  updated_at: string;
};

export default function NutritionPlans() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchNutritionPlans();
  }, []);

  // Fix nutrition plan fetch and type issues
  const fetchNutritionPlans = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fix the query for nutrition plans
      const { data, error } = await supabase
        .from('nutrition_plan_templates')
        .select('*')
        .eq('coach_id', user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        // Process data with proper typing
        const nutritionPlans = data.map(plan => {
          // Handle meals JSON parsing
          let mealsArray: Meal[] = [];
          if (plan.meals) {
            const mealsData = typeof plan.meals === 'string' 
              ? JSON.parse(plan.meals) 
              : plan.meals;
            
            if (Array.isArray(mealsData)) {
              mealsArray = mealsData.map((meal: any) => ({
                id: meal.id || String(Math.random()),
                name: meal.name || '',
                items: Array.isArray(meal.items) ? meal.items.map((item: any) => ({
                  id: item.id || String(Math.random()),
                  name: item.name || '',
                  quantity: Number(item.quantity) || 0,
                  unit: item.unit || 'g',
                  optional: Boolean(item.optional) || false,
                  nutrition: {
                    calories: Number(item.nutrition?.calories) || 0,
                    protein: Number(item.nutrition?.protein) || 0,
                    carbs: Number(item.nutrition?.carbs) || 0,
                    fats: Number(item.nutrition?.fats) || 0,
                    fiber: Number(item.nutrition?.fiber) || 0,
                  }
                })) : []
              }));
            }
          }
          
          return {
            id: plan.id,
            title: plan.title,
            description: plan.description || '',
            meals: mealsArray,
            coach_id: plan.coach_id,
            created_at: plan.created_at,
            updated_at: plan.updated_at
          };
        });
        
        setNutritionPlans(nutritionPlans);
      }

      // Fix client fetch
      const { data: clientData, error: clientError } = await supabase
        .from('coach_clients')
        .select(`
          id,
          client_id,
          status,
          profiles!client_id(id, email, first_name, last_name)
        `)
        .eq('coach_id', user.id)
        .eq('status', 'connected');

      if (clientError) throw clientError;

      if (clientData) {
        // Make sure we're accessing the properties correctly
        const clients = clientData.map(client => {
          if (client.profiles) {
            return {
              id: client.profiles.id,
              email: client.profiles.email,
              firstName: client.profiles.first_name,
              lastName: client.profiles.last_name,
              fullName: `${client.profiles.first_name || ''} ${client.profiles.last_name || ''}`.trim()
            };
          }
          return null;
        }).filter(Boolean);
        
        setClients(clients);
      }
    } catch (error) {
      console.error('Error fetching nutrition plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to load nutrition plans',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    navigate('/create-nutrition-plan');
  };

  const handleAssignPlan = async (planId: string, clientId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to assign a nutrition plan",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('client_nutrition_plans')
        .insert([
          {
            client_id: clientId,
            nutrition_plan_id: planId,
            coach_id: user.id,
            assigned_at: new Date().toISOString(),
            status: 'active',
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Nutrition plan assigned successfully",
      });
    } catch (error) {
      console.error('Error assigning nutrition plan:', error);
      toast({
        title: "Error",
        description: "Failed to assign nutrition plan",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Nutrition Plans</h1>
        <Button onClick={handleCreatePlan}>Create New Plan</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Nutrition Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nutritionPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.title}</TableCell>
                  <TableCell>{plan.description}</TableCell>
                  <TableCell>
                    <Button variant="secondary" onClick={() => navigate(`/create-nutrition-plan/${plan.id}`)}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Connected Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.fullName}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>
                    <Button variant="secondary" onClick={() => handleAssignPlan(nutritionPlans[0]?.id, client.id)}>
                      Assign Plan
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
