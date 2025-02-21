
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Send } from "lucide-react";

interface TrainingPlanDetailsProps {
  plan: {
    id: string;
    name: string;
    description: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function TrainingPlanDetails({ plan, isOpen, onClose }: TrainingPlanDetailsProps) {
  const [clients, setClients] = useState<{ id: string; full_name: string }[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchClients();
    }
  }, [isOpen]);

  const fetchClients = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: clientsData, error } = await supabase
      .from('coach_clients')
      .select(`
        client_id,
        profiles!coach_clients_client_id_fkey (
          id,
          full_name
        )
      `)
      .eq('coach_id', user.id);

    if (error) {
      console.error('Error fetching clients:', error);
      return;
    }

    const formattedClients = clientsData
      .filter(c => c.profiles)
      .map(c => ({
        id: c.profiles.id,
        full_name: c.profiles.full_name || 'Unnamed Client'
      }));

    setClients(formattedClients);
  };

  const handleSendToClient = async () => {
    if (!selectedClientId) {
      toast({
        title: "Error",
        description: "Please select a client",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('workout_plans')
        .insert([
          {
            title: plan.name,
            description: plan.description,
            coach_id: user.id,
            client_id: selectedClientId,
            status: 'active'
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Training plan sent to client successfully",
      });
      
      onClose();
    } catch (error) {
      console.error('Error sending plan to client:', error);
      toast({
        title: "Error",
        description: "Failed to send training plan to client",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{plan.name}</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">{plan.description}</p>
          </div>

          <div>
            <h4 className="font-medium mb-2">Send to Client</h4>
            <select
              className="w-full p-2 border rounded-md"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.full_name}
                </option>
              ))}
            </select>
          </div>

          <Button onClick={handleSendToClient} className="w-full">
            <Send className="w-4 h-4 mr-2" />
            Send to Client
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
