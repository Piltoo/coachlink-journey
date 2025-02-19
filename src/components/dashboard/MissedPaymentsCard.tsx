
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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
    <Card className="bg-white/40 backdrop-blur-lg border border-red-100">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-red-600">Förfallna Betalningar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-2xl font-bold text-red-600">
            {totalMissed.toFixed(2)} kr
            <span className="text-sm font-normal text-muted-foreground ml-2">totalt förfallet</span>
          </div>
          <div className="space-y-2">
            {missedPayments.map((payment) => (
              <div key={payment.id} className="flex justify-between items-center text-sm">
                <div className="flex flex-col">
                  <span className="font-medium">{payment.subscription.client.full_name}</span>
                  <span className="text-red-500">
                    Förföll {format(new Date(payment.due_date), 'MMM d, yyyy')}
                  </span>
                </div>
                <span className="font-medium text-red-600">{Number(payment.amount).toFixed(2)} kr</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
