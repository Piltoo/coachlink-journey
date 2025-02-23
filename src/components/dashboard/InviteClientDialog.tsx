
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
  const [newClientPassword, setNewClientPassword] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleInviteClient = async () => {
    if (!newClientEmail || !newClientName || !newClientPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (newClientPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsInviting(true);

    try {
      // Get current coach
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to invite clients");
      }

      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newClientEmail,
        password: newClientPassword,
        options: {
          data: {
            full_name: newClientName,
            role: 'client'
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user account");

      const newClientId = authData.user.id;

      // Then create the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: newClientId,
          email: newClientEmail,
          full_name: newClientName,
          role: 'client',
          registration_status: 'pending'
        });

      if (profileError) throw profileError;

      // Finally create the coach-client relationship
      const { error: relationshipError } = await supabase
        .from('coach_clients')
        .insert({
          coach_id: user.id,
          client_id: newClientId,
          status: 'not_connected'
        });

      if (relationshipError) throw relationshipError;

      toast({
        title: "Success",
        description: "Client account created successfully",
      });

      // Reset form and close dialog
      setNewClientEmail("");
      setNewClientName("");
      setNewClientPassword("");
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
          <div className="space-y-2">
            <label htmlFor="clientPassword" className="text-sm font-medium">
              Set Password
            </label>
            <Input
              id="clientPassword"
              type="password"
              value={newClientPassword}
              onChange={(e) => setNewClientPassword(e.target.value)}
              placeholder="Set a password for the client"
              minLength={6}
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
