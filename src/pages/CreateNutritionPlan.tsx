import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CreateNutritionPlan() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => navigate('/nutrition-and-training')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Nutrition Plans
        </Button>

        <h1 className="text-2xl font-semibold mb-6">Create New Nutrition Plan</h1>
        
        <div className="bg-card rounded-lg shadow p-6">
          <p className="text-muted-foreground">
            Nutrition plan creation form will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
}
