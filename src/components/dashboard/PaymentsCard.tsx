
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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
    <Card className="bg-white/40 backdrop-blur-lg border border-green-100">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-primary/80">Upcoming Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-2xl font-bold text-primary">
            ${totalDue.toFixed(2)}
            <span className="text-sm font-normal text-muted-foreground ml-2">total due</span>
          </div>
          <div className="space-y-2">
            {upcomingPayments.map((payment) => (
              <div key={payment.id} className="flex justify-between items-center text-sm">
                <div className="flex flex-col">
                  <span className="font-medium">{payment.subscription.client.full_name}</span>
                  <span className="text-muted-foreground">
                    Due {format(new Date(payment.due_date), 'MMM d, yyyy')}
                  </span>
                </div>
                <span className="font-medium">${Number(payment.amount).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
