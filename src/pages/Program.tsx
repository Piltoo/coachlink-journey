
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

type Program = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  coach_id: string;
  client_id: string;
};

const Program = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [newProgram, setNewProgram] = useState({ title: "", description: "", client_id: "" });
  const [clients, setClients] = useState<{ id: string; full_name: string }[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserRoleAndData();
  }, []);

  const fetchUserRoleAndData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile) {
      setUserRole(profile.role);
      
      if (profile.role === 'trainer') {
        // Fetch trainer's clients
        const { data: clientsData } = await supabase
          .from('coach_clients')
          .select('client_id, profiles(id, full_name)')
          .eq('coach_id', user.id);
          
        if (clientsData) {
          setClients(clientsData.map(c => ({
            id: c.profiles.id,
            full_name: c.profiles.full_name || 'Unnamed Client'
          })));
        }
      }

      // Fetch programs based on role
      const query = profile.role === 'trainer'
        ? supabase.from('programs').select('*').eq('coach_id', user.id)
        : supabase.from('programs').select('*').eq('client_id', user.id);

      const { data: programsData, error } = await query;

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load programs",
          variant: "destructive",
        });
        return;
      }

      setPrograms(programsData);
    }
  };

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

    setIsDialogOpen(false);
    setNewProgram({ title: "", description: "", client_id: "" });
    fetchUserRoleAndData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">
            {userRole === 'trainer' ? 'Client Programs' : 'My Program'}
          </h1>
          {userRole === 'trainer' && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
          )}
        </div>

        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => (
              <Card key={program.id}>
                <CardHeader>
                  <CardTitle>{program.title}</CardTitle>
                  <CardDescription>
                    {new Date(program.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{program.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Program;
