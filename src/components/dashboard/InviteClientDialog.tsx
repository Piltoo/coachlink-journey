
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
  const [isInviting, setIsInviting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleInviteClient = async () => {
    if (!newClientEmail || !firstName || !lastName) {
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

      // Generate a new UUID using the crypto API
      const newId = crypto.randomUUID();

      // Create the profile with the generated ID
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: newId,
          email: newClientEmail,
          full_name: `${firstName} ${lastName}`,
          first_name: firstName,
          last_name: lastName,
          role: 'client' as const,
          user_profile: 'client' as const
        }])
        .select()
        .single();

      if (profileError) throw profileError;
      if (!profileData) throw new Error("Failed to create client profile");

      // Create coach-client relationship
      const { error: relationError } = await supabase
        .from('coach_clients')
        .insert({
          coach_id: user.id,
          client_id: profileData.id,
          status: 'not_connected'
        });

      if (relationError) throw relationError;

      toast({
        title: "Success",
        description: "Client account created successfully",
      });

      // Reset form and close dialog
      setFirstName("");
      setLastName("");
      setNewClientEmail("");
      setIsOpen(false);

      // Call the callback to refresh the client list if provided
      if (onClientAdded) {
        await onClientAdded();
      }
    } catch (error: any) {
      console.error("Error creating client:", error);
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
