
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PendingClientCard } from "@/components/waiting-list/PendingClientCard";

type PendingClient = {
  id: string;
  full_name: string | null;
  email: string;
  requested_services: string[];
};

export default function WaitingList() {
  const [pendingClients, setPendingClients] = useState<PendingClient[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingClients();
  }, []);

  const fetchPendingClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: pendingUsers, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, raw_user_meta_data')
        .eq('registration_status', 'pending')
        .eq('role', 'client'); // Only fetch clients

      if (error) throw error;

      if (pendingUsers) {
        const formattedClients = pendingUsers.map(user => ({
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          requested_services: (user.raw_user_meta_data as any)?.requested_services || []
        }));
        setPendingClients(formattedClients);
      }
    } catch (error) {
      console.error("Error in fetchPendingClients:", error);
      toast({
        title: "Error",
        description: "Failed to fetch pending clients",
        variant: "destructive",
      });
    }
  };

  const handleApprove = async (clientId: string) => {
    try {
      const { data: { user: coach } } = await supabase.auth.getUser();
      if (!coach) throw new Error("Coach not authenticated");

      // Create the coach-client relationship
      const { error: relationError } = await supabase
        .from('coach_clients')
        .insert([{
          client_id: clientId,
          coach_id: coach.id,
          status: 'active'
        }]);

      if (relationError) throw relationError;

      // Update the user's registration status
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ registration_status: 'approved' })
        .eq('id', clientId);

      if (updateError) throw updateError;

      setPendingClients(prev => prev.filter(client => client.id !== clientId));
      
      toast({
        title: "Success",
        description: "Client approved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve client",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (clientId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ registration_status: 'rejected' })
        .eq('id', clientId);

      if (error) throw error;

      setPendingClients(prev => prev.filter(client => client.id !== clientId));
      
      toast({
        title: "Success",
        description: "Client rejected successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject client",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <h1 className="text-2xl font-semibold text-primary">Waiting List</h1>
            </div>
            <div className="text-sm text-gray-600">
              {pendingClients.length} client{pendingClients.length !== 1 ? 's' : ''} waiting
            </div>
          </div>

          <div className="grid gap-4">
            {pendingClients.map((client) => (
              <PendingClientCard
                key={client.id}
                client={client}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
            {pendingClients.length === 0 && (
              <Card className="p-6">
                <p className="text-center text-gray-500">No pending clients</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
