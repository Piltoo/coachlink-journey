
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CheckInQuestion {
  id: string;
  question: string;
}

interface FormData {
  weight_kg: number;
  answers: Record<string, string>;
  measurements: {
    neck_cm: number;
    chest_cm: number;
    arm_cm: number;
    waist_cm: number;
    hips_cm: number;
    thigh_cm: number;
  };
}

export default function WeeklyCheckIns() {
  const [questions, setQuestions] = useState<CheckInQuestion[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const form = useForm<FormData>({
    defaultValues: {
      weight_kg: 0,
      answers: {},
      measurements: {
        neck_cm: 0,
        chest_cm: 0,
        arm_cm: 0,
        waist_cm: 0,
        hips_cm: 0,
        thigh_cm: 0,
      },
    },
  });

  useEffect(() => {
    async function checkCanSubmit() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: canCreate, error } = await supabase
        .from('weekly_checkins')
        .select('created_at')
        .eq('client_id', user.id)
        .gt('created_at', new Date(Date.now() - 60000).toISOString())
        .maybeSingle();

      if (error) {
        console.error('Error checking check-in status:', error);
        return;
      }

      if (canCreate) {
        toast({
          title: "Tidslås aktivt",
          description: "Du måste vänta 1 minut innan du kan göra en ny check-in.",
        });
        navigate('/dashboard');
      }
    }

    checkCanSubmit();
  }, [toast, navigate]);

  useEffect(() => {
    async function fetchQuestions() {
      const { data, error } = await supabase
        .from('weekly_checkin_questions')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching questions:', error);
        toast({
          title: "Error",
          description: "Kunde inte hämta frågorna. Försök igen senare.",
          variant: "destructive",
        });
        return;
      }

      setQuestions(data);
    }

    fetchQuestions();
  }, [toast]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Kunde inte verifiera användaren');
      }

      // Kontrollera om användaren kan göra en ny check-in
      const { data: existingCheckIn, error: checkError } = await supabase
        .from('weekly_checkins')
        .select('created_at')
        .eq('client_id', user.id)
        .gt('created_at', new Date(Date.now() - 60000).toISOString())
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingCheckIn) {
        toast({
          title: "Tidslås aktivt",
          description: "Du måste vänta 1 minut innan du kan göra en ny check-in.",
        });
        navigate('/dashboard');
        return;
      }

      const { data: checkinData, error: checkinError } = await supabase
        .from('weekly_checkins')
        .insert([
          {
            weight_kg: data.weight_kg,
            check_in_date: new Date().toISOString(),
            client_id: user.id,
            status: 'pending' as const
          }
        ])
        .select()
        .single();

      if (checkinError) throw checkinError;

      const { error: measurementsError } = await supabase
        .from('measurements')
        .insert([
          {
            ...data.measurements,
            checkin_id: checkinData.id,
            weight_kg: data.weight_kg,
          }
        ]);

      if (measurementsError) throw measurementsError;

      const answers = questions.map(q => ({
        checkin_id: checkinData.id,
        question_id: q.id,
        answer: data.answers[q.id] || '',
      }));

      const { error: answersError } = await supabase
        .from('checkin_answers')
        .insert(answers);

      if (answersError) throw answersError;

      toast({
        title: "Framgång!",
        description: "Din vecko-checkin har sparats.",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting check-in:', error);
      toast({
        title: "Error",
        description: "Kunde inte spara check-in. Försök igen senare.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Vecko Check-in</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Vikt och Mått</h3>
                <FormField
                  control={form.control}
                  name="weight_kg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vikt (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="measurements.neck_cm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hals (cm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="measurements.chest_cm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bröst (cm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="measurements.arm_cm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Arm (cm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="measurements.waist_cm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Midja (cm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="measurements.hips_cm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Höfter (cm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="measurements.thigh_cm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lår (cm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Frågor</h3>
                {questions.map((question) => (
                  <FormField
                    key={question.id}
                    control={form.control}
                    name={`answers.${question.id}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{question.question}</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sparar..." : "Skicka Check-in"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
