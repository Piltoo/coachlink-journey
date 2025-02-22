import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Send, ChevronDown, ChevronUp, Copy, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreateNutritionPlanDialog } from "./CreateNutritionPlanDialog";
import { useToast } from "@/hooks/use-toast";
import { ClientSelect } from "../messages/ClientSelect";
import { useNavigate } from "react-router-dom";

type Template = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  meals: any | null;
};

type Client = {
  id: string;
  full_name: string | null;
  email: string;
};

export function NutritionPlansSection() {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientSelect, setShowClientSelect] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const { data: templates = [], refetch } = useQuery({
    queryKey: ["nutrition_plan_templates"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('nutrition_plan_templates')
        .select('*')
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    }
  });

  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('coach_clients')
        .select(`
          client_id,
          profiles!coach_clients_client_id_fkey (
            id,
            full_name,
            email
          )
        `)
        .eq('coach_id', user.id);

      if (error) throw error;

      if (!data) return [];

      return data
        .filter(d => d.profiles)
        .map(d => ({
          id: d.profiles.id,
          full_name: d.profiles.full_name,
          email: d.profiles.email
        }));
    }
  });

  const handleSendToClient = async (template: Template) => {
    if (!selectedClient) {
      toast({
        title: "Error",
        description: "Please select a client first",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('nutrition_plans')
        .insert([
          {
            title: template.title,
            description: template.description,
            meal_plan: template.meals,
            coach_id: user.id,
            client_id: selectedClient.id,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Nutrition plan sent to client successfully",
      });

      setSelectedClient(null);
      setShowClientSelect(prev => ({ ...prev, [template.id]: false }));
    } catch (error) {
      console.error('Error sending nutrition plan:', error);
      toast({
        title: "Error",
        description: "Failed to send nutrition plan to client",
        variant: "destructive",
      });
    }
  };

  const toggleClientSelect = (templateId: string) => {
    setShowClientSelect(prev => ({
      ...prev,
      [templateId]: !prev[templateId]
    }));
  };

  const handleCopyTemplate = async (template: Template) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newTitle = `${template.title} (Copy)`;
      const { error } = await supabase
        .from('nutrition_plan_templates')
        .insert([
          {
            title: newTitle,
            description: template.description,
            meals: template.meals,
            coach_id: user.id,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template copied successfully",
      });

      refetch();
    } catch (error) {
      console.error('Error copying template:', error);
      toast({
        title: "Error",
        description: "Failed to copy template",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('nutrition_plan_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template deleted successfully",
      });

      refetch();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Nutrition Plan Templates</h2>
        <Button onClick={() => navigate("/nutrition-and-training/create-nutrition-plan")}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle>{template.title}</CardTitle>
              <CardDescription>
                Created on {new Date(template.created_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {template.description}
              </p>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setIsCreateDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleCopyTemplate(template)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => toggleClientSelect(template.id)}
                  >
                    {showClientSelect[template.id] ? (
                      <ChevronUp className="h-4 w-4 mr-2" />
                    ) : (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    )}
                    Send to Client
                  </Button>
                  {showClientSelect[template.id] && (
                    <div className="space-y-2">
                      <ClientSelect
                        clients={clients}
                        selectedClient={selectedClient}
                        onSelect={setSelectedClient}
                        disabled={isLoadingClients}
                      />
                      <Button
                        className="w-full"
                        onClick={() => handleSendToClient(template)}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send Plan
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateNutritionPlanDialog
        isOpen={isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setSelectedTemplate(null);
        }}
        onPlanCreated={() => {
          refetch();
        }}
        planToEdit={selectedTemplate}
      />

      {templates.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No nutrition plan templates created yet.
        </div>
      )}
    </div>
  );
}
