import { useEffect, useState } from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { GlassCard } from "@/components/ui/glass-card";

type Payment = {
  id: string;
  amount: number;
  due_date: string;
  status: string;
  subscription: {
    client: {
      full_name: string;
    };
  };
};

export const PaymentsCard = () => {
  const [upcomingPayments, setUpcomingPayments] = useState<Payment[]>([]);
  const [totalDue, setTotalDue] = useState(0);

  useEffect(() => {
    const fetchPayments = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: payments, error } = await supabase
        .from('payments')
        .select(`
          id,
          amount,
          due_date,
          status,
          subscription:subscriptions (
            client:profiles!subscriptions_client_id_fkey (
              full_name
            )
          )
        `)
        .eq('status', 'pending')
        .order('due_date', { ascending: true })
        .limit(5);

      if (error) {
        console.error('Error fetching payments:', error);
        return;
      }

      setUpcomingPayments(payments);
      const total = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
      setTotalDue(total);
    };

    fetchPayments();
  }, []);

  return (
    <GlassCard className="p-4">
      <h3 className="text-sm font-medium text-gray-600 mb-2">Upcoming Payments</h3>
      <p className="text-4xl font-bold text-[#1B4332]">{totalDue.toFixed(2)} kr</p>
      <div className="mt-4 space-y-2 max-h-[150px] overflow-y-auto">
        {upcomingPayments.map((payment) => (
          <div key={payment.id} className="flex justify-between items-center text-sm">
            <div>
              <span className="text-xs text-gray-600">{payment.subscription.client.full_name}</span>
              <br />
              <span className="text-xs text-gray-500">
                Due {format(new Date(payment.due_date), 'MMM d')}
              </span>
            </div>
            <span className="text-xs font-medium">{Number(payment.amount).toFixed(2)} kr</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};
