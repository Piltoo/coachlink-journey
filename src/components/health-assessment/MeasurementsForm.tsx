
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  neck_cm: z.string().min(1, "Halsmått krävs"),
  chest_cm: z.string().min(1, "Bröstmått krävs"),
  arm_cm: z.string().min(1, "Armmått krävs"),
  waist_cm: z.string().min(1, "Midjemått krävs"),
  hips_cm: z.string().min(1, "Höftmått krävs"),
  thigh_cm: z.string().min(1, "Lårmått krävs"),
});

interface MeasurementsFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
}

export function MeasurementsForm({ onSubmit }: MeasurementsFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      neck_cm: "",
      chest_cm: "",
      arm_cm: "",
      waist_cm: "",
      hips_cm: "",
      thigh_cm: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="neck_cm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Halsmått (cm)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="chest_cm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bröstmått (cm)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="arm_cm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Armmått (cm)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="waist_cm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Midjemått (cm)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hips_cm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Höftmått (cm)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="thigh_cm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lårmått (cm)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">Slutför bedömning</Button>
      </form>
    </Form>
  );
}
