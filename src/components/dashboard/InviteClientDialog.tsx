
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InviteClientDialogProps {
  onClientAdded?: () => void;
}

export const InviteClientDialog = ({ onClientAdded }: InviteClientDialogProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleInviteClient = async () => {
    if (!newClientEmail || !firstName || !lastName || !tempPassword) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsInviting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be logged in to create clients");
      }

      // Try to create auth user first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newClientEmail,
        password: tempPassword,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      // If we successfully created an auth user
      if (authData.user && !authError) {
        // First create the profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: newClientEmail,
            full_name: `${firstName} ${lastName}`,
            role: 'client'
          });

        if (profileError) {
          console.error("Failed to create profile:", profileError);
          throw profileError;
        }

        // Then create coach-client relationship
        const { error: relationError } = await supabase
          .from('coach_clients')
          .insert({
            coach_id: user.id,
            client_id: authData.user.id,
            status: 'not_connected'
          });

        if (relationError) {
          console.error("Failed to create coach-client relationship:", relationError);
          // Even if this fails, we continue to create the not_connected entry as backup
        }
      } else {
        // If auth user creation failed, log it but continue
        console.log("Could not create auth user:", authError);
      }

      // Always create entry in clients_not_connected as backup
      const { error: notConnectedError } = await supabase
        .from('clients_not_connected')
        .insert({
          email: newClientEmail,
          first_name: firstName,
          last_name: lastName,
          coach_id: user.id
        });

      if (notConnectedError && notConnectedError.code !== '23505') { // Ignore unique violation
        throw notConnectedError;
      }

      toast({
        title: "Success",
        description: `Client has been added. Their temporary password is: ${tempPassword}`,
        duration: 10000, // Show for 10 seconds so coach has time to copy
      });

      // Reset form and close dialog
      setFirstName("");
      setLastName("");
      setNewClientEmail("");
      setTempPassword("");
      setIsOpen(false);

      // Call the callback to refresh the client list if provided
      if (onClientAdded) {
        await onClientAdded();
      }
    } catch (error: any) {
      console.error("Error creating client:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create client",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)}>Create New Client</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Client</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter client's first name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter client's last name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientEmail">Client Email *</Label>
            <Input
              id="clientEmail"
              type="email"
              value={newClientEmail}
              onChange={(e) => setNewClientEmail(e.target.value)}
              placeholder="Enter client's email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tempPassword">Temporary Password *</Label>
            <Input
              id="tempPassword"
              type="text"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              placeholder="Set a temporary password"
              required
            />
          </div>
          <Button 
            onClick={handleInviteClient}
            disabled={isInviting}
            className="w-full"
          >
            {isInviting ? "Creating Client..." : "Create Client"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
