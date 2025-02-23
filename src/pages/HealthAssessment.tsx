
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { HealthAssessmentForm } from "@/components/health-assessment/HealthAssessmentForm";
import { MeasurementsForm } from "@/components/health-assessment/MeasurementsForm";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const HealthAssessment = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [healthData, setHealthData] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleHealthAssessmentSubmit = async (data: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: assessment, error } = await supabase
        .from('client_health_assessments')
        .insert([
          {
            client_id: user.id,
            ...data
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setHealthData(assessment);
      setStep(2);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleMeasurementsSubmit = async (measurementsData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Skapa en ny weekly checkin först
      const { data: checkin, error: checkinError } = await supabase
        .from('weekly_checkins')
        .insert([
          { client_id: user.id }
        ])
        .select()
        .single();

      if (checkinError) throw checkinError;

      // Lägg till mätningarna kopplade till checkin
      const { error: measurementsError } = await supabase
        .from('measurements')
        .insert([
          {
            ...measurementsData,
            checkin_id: checkin.id
          }
        ]);

      if (measurementsError) throw measurementsError;

      // Uppdatera användarens profil för att markera att bedömningen är klar
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ has_completed_assessment: true })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "Bedömning slutförd",
        description: "Din hälsobedömning har sparats framgångsrikt.",
      });

      navigate('/dashboard');
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50 p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            {step === 1 ? "Hälsobedömning" : "Kroppsmätningar"}
          </h1>
          <p className="text-gray-600">
            {step === 1 
              ? "Hjälp oss förstå din nuvarande hälsosituation bättre"
              : "Registrera dina kroppsmätningar för att spåra din progress"
            }
          </p>
        </div>

        <Progress value={step === 1 ? 50 : 100} className="h-2" />

        {step === 1 ? (
          <HealthAssessmentForm onSubmit={handleHealthAssessmentSubmit} />
        ) : (
          <MeasurementsForm onSubmit={handleMeasurementsSubmit} />
        )}
      </div>
    </div>
  );
};

export default HealthAssessment;
