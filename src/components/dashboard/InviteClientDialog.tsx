
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InviteClientDialogProps {
  onClientAdded?: () => void;
}

const serviceOptions = [
  { id: "personal-training", label: "Personal Training" },
  { id: "coaching", label: "Coaching" },
  { id: "treatments", label: "Treatments" },
  { id: "others", label: "Others" },
];

export const InviteClientDialog = ({ onClientAdded }: InviteClientDialogProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPassword, setNewClientPassword] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isInviting, setIsInviting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleInviteClient = async () => {
    if (!newClientEmail || !firstName || !lastName || !newClientPassword || selectedServices.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and select at least one service",
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be logged in to invite clients");
      }

      // Call the invite_client function to create the new client
      const { data, error } = await supabase.rpc('invite_client', {
        client_email: newClientEmail,
        client_name: `${firstName} ${lastName}`,
        client_password: newClientPassword
      });

      if (error) throw error;

      // Update the requested services
      const { error: serviceError } = await supabase
        .from('coach_clients')
        .update({ 
          requested_services: selectedServices,
          status: 'not_connected'
        })
        .eq('client_id', data)
        .eq('coach_id', user.id);

      if (serviceError) throw serviceError;

      toast({
        title: "Success",
        description: "Client account created successfully",
      });

      // Reset form and close dialog
      setFirstName("");
      setLastName("");
      setNewClientEmail("");
      setNewClientPassword("");
      setSelectedServices([]);
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
            <Label htmlFor="clientPassword">Set Password *</Label>
            <Input
              id="clientPassword"
              type="password"
              value={newClientPassword}
              onChange={(e) => setNewClientPassword(e.target.value)}
              placeholder="Set a password for the client (min. 6 characters)"
              minLength={6}
              required
            />
          </div>
          <div className="space-y-4">
            <Label>Select Required Services *</Label>
            <div className="space-y-3">
              {serviceOptions.map((service) => (
                <div key={service.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={service.id}
                    checked={selectedServices.includes(service.id)}
                    onCheckedChange={(checked) => {
                      setSelectedServices(prev =>
                        checked
                          ? [...prev, service.id]
                          : prev.filter(id => id !== service.id)
                      );
                    }}
                  />
                  <Label htmlFor={service.id}>{service.label}</Label>
                </div>
              ))}
            </div>
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
