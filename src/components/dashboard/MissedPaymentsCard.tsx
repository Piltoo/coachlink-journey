import { useEffect, useState } from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { GlassCard } from "@/components/ui/glass-card";

type MissedPayment = {
  id: string;
  amount: number;
  due_date: string;
  subscription: {
    client: {
      full_name: string;
    };
  };
};

export const MissedPaymentsCard = () => {
  const [missedPayments, setMissedPayments] = useState<MissedPayment[]>([]);
  const [totalMissed, setTotalMissed] = useState(0);

  useEffect(() => {
    const fetchMissedPayments = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get payments that are past due date and still pending
      const { data: payments, error } = await supabase
        .from('payments')
        .select(`
          id,
          amount,
          due_date,
          subscription:subscriptions (
            client:profiles!subscriptions_client_id_fkey (
              full_name
            )
          )
        `)
        .eq('status', 'pending')
        .lt('due_date', new Date().toISOString())
        .order('due_date', { ascending: false });

      if (error) {
        console.error('Error fetching missed payments:', error);
        return;
      }

      setMissedPayments(payments);
      const total = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
      setTotalMissed(total);
    };

    fetchMissedPayments();
  }, []);

  return (
    <GlassCard className="p-4">
      <h3 className="text-sm font-medium text-red-600 mb-2">Missed Payments</h3>
      <p className="text-4xl font-bold text-red-600">{totalMissed.toFixed(2)} kr</p>
      <div className="mt-4 space-y-2 max-h-[150px] overflow-y-auto">
        {missedPayments.map((payment) => (
          <div key={payment.id} className="flex justify-between items-center text-sm">
            <div>
              <span className="text-xs text-gray-600">{payment.subscription.client.full_name}</span>
              <br />
              <span className="text-xs text-red-500">
                Due {format(new Date(payment.due_date), 'MMM d')}
              </span>
            </div>
            <span className="text-xs font-medium text-red-600">{Number(payment.amount).toFixed(2)} kr</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};
