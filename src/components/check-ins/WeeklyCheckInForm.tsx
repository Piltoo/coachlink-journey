
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Measurement = {
  chest_cm: string;
  waist_cm: string;
  hips_cm: string;
  thigh_cm: string;
  arm_cm: string;
};

export const WeeklyCheckInForm = () => {
  const { toast } = useToast();
  const [weight, setWeight] = useState("");
  const [measurements, setMeasurements] = useState<Measurement>({
    chest_cm: "",
    waist_cm: "",
    hips_cm: "",
    thigh_cm: "",
    arm_cm: "",
  });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questions, setQuestions] = useState<Array<{ id: string; question: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch questions on component mount
  useState(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from('weekly_checkin_questions')
        .select('id, question');
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to load questions. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setQuestions(data);
        const initialAnswers: Record<string, string> = {};
        data.forEach(q => initialAnswers[q.id] = "");
        setAnswers(initialAnswers);
      }
    };

    fetchQuestions();
  }, []);

  const handleMeasurementChange = (key: keyof Measurement, value: string) => {
    setMeasurements(prev => ({ ...prev, [key]: value }));
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create weekly check-in
      const { data: checkinData, error: checkinError } = await supabase
        .from('weekly_checkins')
        .insert([{
          weight_kg: parseFloat(weight),
          status: 'completed'
        }])
        .select()
        .single();

      if (checkinError) throw checkinError;

      // Add measurements
      const { error: measurementError } = await supabase
        .from('measurements')
        .insert([{
          checkin_id: checkinData.id,
          chest_cm: parseFloat(measurements.chest_cm),
          waist_cm: parseFloat(measurements.waist_cm),
          hips_cm: parseFloat(measurements.hips_cm),
          thigh_cm: parseFloat(measurements.thigh_cm),
          arm_cm: parseFloat(measurements.arm_cm),
        }]);

      if (measurementError) throw measurementError;

      // Add answers
      const answersToInsert = Object.entries(answers).map(([questionId, answer]) => ({
        checkin_id: checkinData.id,
        question_id: questionId,
        answer
      }));

      const { error: answersError } = await supabase
        .from('checkin_answers')
        .insert(answersToInsert);

      if (answersError) throw answersError;

      toast({
        title: "Success!",
        description: "Your weekly check-in has been submitted.",
      });

      // Reset form
      setWeight("");
      setMeasurements({
        chest_cm: "",
        waist_cm: "",
        hips_cm: "",
        thigh_cm: "",
        arm_cm: "",
      });
      const resetAnswers: Record<string, string> = {};
      questions.forEach(q => resetAnswers[q.id] = "");
      setAnswers(resetAnswers);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit check-in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100 p-6">
        <h2 className="text-xl font-semibold text-primary mb-4">Weekly Check-in</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
              Weight (kg)
            </label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter weight in kg"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(measurements).map(([key, value]) => (
              <div key={key}>
                <label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-1">
                  {key.replace('_cm', '').split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')} (cm)
                </label>
                <Input
                  id={key}
                  type="number"
                  step="0.1"
                  value={value}
                  onChange={(e) => handleMeasurementChange(key as keyof Measurement, e.target.value)}
                  placeholder={`Enter ${key.replace('_cm', '')} measurement`}
                  required
                />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {questions.map((q) => (
              <div key={q.id}>
                <label htmlFor={q.id} className="block text-sm font-medium text-gray-700 mb-1">
                  {q.question}
                </label>
                <Input
                  id={q.id}
                  value={answers[q.id]}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  placeholder="Your answer"
                  required
                />
              </div>
            ))}
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Check-in"}
          </Button>
        </div>
      </GlassCard>
    </form>
  );
};
