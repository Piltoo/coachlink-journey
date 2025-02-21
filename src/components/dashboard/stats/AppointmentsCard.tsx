
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";
import { format } from "date-fns";

type Appointment = {
  start_time: string;
  end_time: string;
  client: {
    full_name: string | null;
    email: string;
  };
};

export const AppointmentsCard = () => {
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchTodayAppointments = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const { data: appointments } = await supabase
        .from('workout_sessions')
        .select(`
          start_time,
          end_time,
          client:profiles!workout_sessions_client_id_fkey (
            full_name,
            email
          )
        `)
        .eq('coach_id', user.id)
        .eq('status', 'confirmed')
        .gte('start_time', startOfDay)
        .lte('start_time', endOfDay)
        .order('start_time', { ascending: true });

      if (appointments) {
        setTodayAppointments(appointments);
      }
    };

    fetchTodayAppointments();
  }, []);

  return (
    <GlassCard className="col-span-2 bg-white/40 backdrop-blur-lg border border-green-100">
      <h2 className="text-sm font-medium text-primary/80 mb-4">Your appointments for today</h2>
      <div className="space-y-3">
        {todayAppointments.length > 0 ? (
          todayAppointments.map((appointment, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
              <div>
                <p className="font-medium">{appointment.client.full_name || appointment.client.email}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(appointment.start_time), "HH:mm")} - {format(new Date(appointment.end_time), "HH:mm")}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No appointments scheduled for today</p>
        )}
      </div>
    </GlassCard>
  );
};
