
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type CreateProgramDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  clients: { id: string; full_name: string }[];
  onProgramCreated: () => void;
};

export const CreateProgramDialog = ({
  isOpen,
  onOpenChange,
  clients,
  onProgramCreated
}: CreateProgramDialogProps) => {
  const [newProgram, setNewProgram] = useState({ title: "", description: "", client_id: "" });
  const { toast } = useToast();

  const handleCreateProgram = async () => {
    if (!newProgram.title || !newProgram.description || !newProgram.client_id) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('programs')
      .insert({
        title: newProgram.title,
        description: newProgram.description,
        client_id: newProgram.client_id,
        coach_id: user.id
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create program",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Program created successfully",
    });

    onOpenChange(false);
    setNewProgram({ title: "", description: "", client_id: "" });
    onProgramCreated();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>Create New Program</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Program</DialogTitle>
          <DialogDescription>
            Create a personalized program for your client
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Client</label>
            <select
              className="w-full p-2 border rounded-md"
              value={newProgram.client_id}
              onChange={(e) => setNewProgram(prev => ({ ...prev, client_id: e.target.value }))}
            >
              <option value="">Select a client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.full_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              value={newProgram.title}
              onChange={(e) => setNewProgram(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Program title"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={newProgram.description}
              onChange={(e) => setNewProgram(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Program description and details"
            />
          </div>
          <Button onClick={handleCreateProgram}>Create Program</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
