import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [tempPassword, setTempPassword] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
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

    if (selectedServices.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one service",
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

      // Spara coachens session
      const currentSession = await supabase.auth.getSession();
      
      // Skapa klienten
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newClientEmail,
        password: tempPassword,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            requested_services: selectedServices
          }
        }
      });

      // Återställ coachens session direkt
      if (currentSession.data.session) {
        await supabase.auth.setSession(currentSession.data.session);
      }

      // Om vi lyckades skapa användaren
      if (authData.user && !authError) {
        // Skapa profilen
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: newClientEmail,
            full_name: `${firstName} ${lastName}`,
            role: 'client',
            requested_services: selectedServices,
            has_completed_assessment: false
          });

        if (profileError) {
          console.error("Failed to create profile:", profileError);
          throw profileError;
        }

        // Skapa coach-client relationen
        const { error: relationError } = await supabase
          .from('coach_clients')
          .insert({
            coach_id: user.id,
            client_id: authData.user.id,
            status: 'not_connected',
            requested_services: selectedServices,
            created_at: new Date().toISOString()
          });

        if (relationError) {
          console.error("Failed to create coach-client relationship:", relationError);
          throw relationError;
        }

        toast({
          title: "Success",
          description: `Client has been added. Their temporary password is: ${tempPassword}`,
          duration: 10000,
        });

        // Återställ formuläret och stäng dialogen
        setFirstName("");
        setLastName("");
        setNewClientEmail("");
        setTempPassword("");
        setSelectedServices([]);
        setIsOpen(false);

        // Uppdatera klientlistan om callback finns
        if (onClientAdded) {
          onClientAdded();
        }
      } else {
        throw new Error(authError?.message || "Failed to create client account");
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
          <div className="space-y-2">
            <Label>Services Requested *</Label>
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
                  <label
                    htmlFor={service.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {service.label}
                  </label>
                </div>
              ))}
            </div>
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
