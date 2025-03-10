
import { ScrollArea } from "@/components/ui/scroll-area";
import { GlassCard } from "@/components/ui/glass-card";
import { format } from "date-fns";
import { TodaySession } from "./types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface TodaySessionsProps {
  sessions: TodaySession[];
}

export function TodaySessions({ sessions }: TodaySessionsProps) {
  const { data: pendingRequests = 0 } = useQuery({
    queryKey: ["pending_sessions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from('workout_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('coach_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      return count || 0;
    }
  });

  return (
    <GlassCard className="p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-600">Today's Assignments</h3>
        {pendingRequests > 0 && (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            {pendingRequests} pending request{pendingRequests !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {sessions.length > 0 ? (
        <>
          <p className="text-2xl font-bold text-[#1B4332] mb-4">{sessions.length} sessions today</p>
          <ScrollArea className="h-[calc(100vh-280px)] w-full pr-4">
            <div className="space-y-3">
              {sessions.map((session, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center p-4 bg-white/60 rounded-lg border border-green-100"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">{session.client.full_name || session.client.email}</h4>
                    <p className="text-sm text-gray-500">Session</p>
                  </div>
                  <span className="text-sm font-medium text-primary">
                    {format(new Date(session.start_time), 'HH:mm')}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </>
      ) : (
        <div className="h-[calc(100vh-280px)] flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#1B4332]">No sessions today</p>
            <p className="text-sm text-gray-500 mt-2">Enjoy your free time!</p>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
