
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InviteClientDialogProps {
  onClientAdded?: () => void;
}

export const InviteClientDialog = ({ onClientAdded }: InviteClientDialogProps) => {
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const DEFAULT_PASSWORD = "test123";

  const handleInviteClient = async () => {
    if (!newClientEmail || !newClientName) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsInviting(true);

    try {
      // Use the invite_client function with default password
      const { data, error } = await supabase
        .rpc('invite_client', {
          client_email: newClientEmail,
          client_name: newClientName,
          client_password: DEFAULT_PASSWORD
        });

      if (error) throw error;

      console.log("Client invited successfully:", data);

      toast({
        title: "Success",
        description: "Client account created successfully. They can log in with the temporary password: test123",
      });

      // Reset form and close dialog
      setNewClientEmail("");
      setNewClientName("");
      setIsOpen(false);

      // Call the callback to refresh the client list if provided
      if (onClientAdded) {
        await onClientAdded();
      }
    } catch (error: any) {
      console.error("Error inviting client:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create client account",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)}>Invite New Client</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Client Account</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="clientName" className="text-sm font-medium">
              Client Name
            </label>
            <Input
              id="clientName"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              placeholder="Enter client's name"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="clientEmail" className="text-sm font-medium">
              Client Email
            </label>
            <Input
              id="clientEmail"
              type="email"
              value={newClientEmail}
              onChange={(e) => setNewClientEmail(e.target.value)}
              placeholder="Enter client's email"
            />
          </div>
          <Button 
            onClick={handleInviteClient}
            disabled={isInviting}
            className="w-full"
          >
            {isInviting ? "Creating Account..." : "Create Client Account"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
