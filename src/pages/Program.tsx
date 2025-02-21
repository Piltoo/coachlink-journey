
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreateProgramDialog } from "@/components/programs/CreateProgramDialog";
import { ProgramCard } from "@/components/programs/ProgramCard";

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
  const [clients, setClients] = useState<{ id: string; full_name: string }[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

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
      
      if (profile.role === 'coach') {
        const { data: clientsData } = await supabase
          .from('coach_clients')
          .select(`
            client_id,
            profiles!coach_clients_client_id_fkey (
              id,
              full_name
            )
          `)
          .eq('coach_id', user.id);
          
        if (clientsData) {
          setClients(clientsData.map(c => ({
            id: c.profiles.id,
            full_name: c.profiles.full_name || 'Unnamed Client'
          })));
        }
      }

      const query = profile.role === 'coach'
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

  useEffect(() => {
    fetchUserRoleAndData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">
            {userRole === 'coach' ? 'Client Programs' : 'My Program'}
          </h1>
          {userRole === 'coach' && (
            <CreateProgramDialog
              isOpen={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              clients={clients}
              onProgramCreated={fetchUserRoleAndData}
            />
          )}
        </div>

        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Program;
