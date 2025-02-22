
import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export const ClientRequestsCard = () => {
  const [requestCount, setRequestCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchNewArrivalsCount = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: notConnectedClients, error } = await supabase
          .from('coach_clients')
          .select('client_id', { count: 'exact' })
          .eq('coach_id', user.id)
          .eq('status', 'not_connected');

        if (error) throw error;

        setRequestCount(notConnectedClients?.length || 0);
      } catch (error: any) {
        console.error("Error fetching new arrivals count:", error);
        toast({
          title: "Error",
          description: "Failed to load new arrivals count",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewArrivalsCount();
  }, [toast]);

  if (isLoading) {
    return (
      <GlassCard className="p-6">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-8 w-[60px]" />
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="rounded-full bg-orange-100 p-3 w-fit">
        <Users className="w-6 h-6 text-orange-600" />
      </div>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">New Arrivals</p>
        <p className="text-2xl font-bold">{requestCount}</p>
      </div>
    </GlassCard>
  );
};
