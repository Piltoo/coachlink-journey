
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
}

export default function WeeklyCheckIns() {
  const [questions, setQuestions] = useState<CheckInQuestion[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const form = useForm<FormData>({
    defaultValues: {
      weight_kg: 0,
      answers: {},
    },
  });

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
      // Först skapar vi weekly checkin
      const { data: checkinData, error: checkinError } = await supabase
        .from('weekly_checkins')
        .insert([
          {
            weight_kg: data.weight_kg,
            check_in_date: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (checkinError) throw checkinError;

      // Sen sparar vi svaren
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

      form.reset();
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
