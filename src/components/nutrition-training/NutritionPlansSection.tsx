
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function NutritionPlansSection() {
  const navigate = useNavigate();

  const { data: templates = [] } = useQuery({
    queryKey: ["nutrition_plan_templates"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('nutrition_plan_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="bg-white/40 backdrop-blur-lg rounded-lg border border-gray-200/50 p-6 shadow-sm transition-all duration-200 ease-in-out">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Nutrition Plans</h2>
        <Button 
          onClick={() => navigate("/nutrition-training/create")}
          className="bg-[#a7cca4] hover:bg-[#96bb93] text-white font-medium"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card 
            key={template.id} 
            className="cursor-pointer hover:bg-accent/5 transition-colors"
            onClick={() => navigate(`/nutrition-training/create?template=${template.id}`)}
          >
            <CardHeader>
              <CardTitle>{template.title}</CardTitle>
              <CardDescription>
                Created on {new Date(template.created_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {template.description || "No description provided"}
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/nutrition-training/create?template=${template.id}`);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No nutrition plans created yet.
        </div>
      )}
    </div>
  );
}
