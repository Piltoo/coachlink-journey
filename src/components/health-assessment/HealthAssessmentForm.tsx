
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  starting_weight: z.string().min(1, "Vikt är obligatoriskt"),
  target_weight: z.string().min(1, "Målvikt är obligatoriskt"),
  current_activity_level: z.string().min(1, "Aktivitetsnivå är obligatoriskt"),
  previous_exercise_experience: z.string(),
  health_goals: z.string().min(1, "Hälsomål är obligatoriskt"),
  medical_conditions: z.string(),
  dietary_restrictions: z.string(),
  sleep_patterns: z.string(),
  stress_levels: z.string().min(1, "Stressnivå är obligatoriskt"),
});

interface HealthAssessmentFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
}

export function HealthAssessmentForm({ onSubmit }: HealthAssessmentFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      starting_weight: "",
      target_weight: "",
      current_activity_level: "",
      previous_exercise_experience: "",
      health_goals: "",
      medical_conditions: "",
      dietary_restrictions: "",
      sleep_patterns: "",
      stress_levels: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="starting_weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nuvarande vikt (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="target_weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Målvikt (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="current_activity_level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nuvarande aktivitetsnivå</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Välj aktivitetsnivå" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="sedentary">Stillasittande</SelectItem>
                  <SelectItem value="light">Lätt aktiv</SelectItem>
                  <SelectItem value="moderate">Måttligt aktiv</SelectItem>
                  <SelectItem value="very">Mycket aktiv</SelectItem>
                  <SelectItem value="extra">Extra aktiv</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="health_goals"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hälsomål</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Beskriv dina hälso- och träningsmål" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="previous_exercise_experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tidigare träningserfarenhet</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Beskriv din tidigare träningserfarenhet" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="medical_conditions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medicinska tillstånd</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Lista eventuella medicinska tillstånd eller skador" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dietary_restrictions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kostrestriktioner</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Lista eventuella matallergier eller kostrestriktioner" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sleep_patterns"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sömnmönster</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Beskriv dina sömnvanor" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="stress_levels"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stressnivå</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Välj stressnivå" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Låg</SelectItem>
                  <SelectItem value="medium">Medel</SelectItem>
                  <SelectItem value="high">Hög</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">Fortsätt till mätningar</Button>
      </form>
    </Form>
  );
}
