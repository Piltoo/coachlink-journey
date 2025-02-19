
import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { WeeklyCheckInForm } from "@/components/check-ins/WeeklyCheckInForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type UserRole = 'client' | 'trainer' | 'admin';

type Client = {
  id: string;
  full_name: string | null;
  email: string;
  status: string;
};

type CheckIn = {
  id: string;
  created_at: string;
  weight_kg: number;
  profiles: {
    full_name: string | null;
    email: string;
  };
};

const Dashboard = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckIn[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        });
        return;
      }

      setUserRole(profile.role as UserRole);

      if (profile.role === 'trainer') {
        // Fetch coach's clients
        const { data: clientsData, error: clientsError } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            email,
            coach_clients!inner (
              status
            )
          `)
          .eq('coach_clients.coach_id', user.id);

        if (clientsError) {
          toast({
            title: "Error",
            description: "Failed to load clients",
            variant: "destructive",
          });
          return;
        }

        setClients(clientsData.map(c => ({
          id: c.id,
          full_name: c.full_name,
          email: c.email,
          status: c.coach_clients[0].status
        })));

        // Fetch recent check-ins
        const { data: checkIns, error: checkInsError } = await supabase
          .from('weekly_checkins')
          .select(`
            id,
            created_at,
            weight_kg,
            profiles:client_id (
              full_name,
              email
            )
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (checkInsError) {
          toast({
            title: "Error",
            description: "Failed to load recent check-ins",
            variant: "destructive",
          });
          return;
        }

        setRecentCheckIns(checkIns || []);
      }
    };

    fetchUserRole();
  }, []);

  const handleCheckInClick = (checkInId: string) => {
    navigate(`/check-ins/${checkInId}`);
  };

  const handleClientClick = (clientId: string) => {
    navigate(`/clients/${clientId}`);
  };

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
      const { data, error } = await supabase
        .rpc('invite_client', {
          client_email: newClientEmail,
          client_name: newClientName
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Client invitation sent successfully",
      });

      // Reset form
      setNewClientEmail("");
      setNewClientName("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to invite client",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-primary">Welcome Back</h1>
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          {userRole === 'trainer' && (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-primary">My Clients</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Invite New Client</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite a New Client</DialogTitle>
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
                        {isInviting ? "Sending Invitation..." : "Send Invitation"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map((client) => (
                  <GlassCard
                    key={client.id}
                    className="bg-white/40 backdrop-blur-lg border border-green-100 p-6 cursor-pointer hover:bg-white/50 transition-colors"
                    onClick={() => handleClientClick(client.id)}
                  >
                    <div className="flex flex-col space-y-2">
                      <h3 className="font-semibold text-lg text-primary">
                        {client.full_name || client.email}
                      </h3>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                      <span className={`text-sm px-2 py-1 rounded-full w-fit ${
                        client.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {client.status}
                      </span>
                    </div>
                  </GlassCard>
                ))}
              </div>

              <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100 p-6">
                <h3 className="text-xl font-semibold text-primary mb-4">Recent Client Check-ins</h3>
                <div className="space-y-4">
                  {recentCheckIns.map((checkIn) => (
                    <div
                      key={checkIn.id}
                      onClick={() => handleCheckInClick(checkIn.id)}
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
                    >
                      <div>
                        <p className="font-medium text-primary">
                          {checkIn.profiles.full_name || checkIn.profiles.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Weight: {checkIn.weight_kg}kg
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-accent">
                          {new Date(checkIn.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Check-in Complete</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </>
          )}

          {userRole === 'client' && <WeeklyCheckInForm />}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100">
              <div className="flex flex-col">
                <h2 className="text-lg font-medium text-primary/80 mb-2">Active Clients</h2>
                <p className="text-4xl font-bold text-primary">12</p>
                <span className="text-sm text-accent mt-2">↑ 2 new this week</span>
              </div>
            </GlassCard>
            
            <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100">
              <div className="flex flex-col">
                <h2 className="text-lg font-medium text-primary/80 mb-2">Programs</h2>
                <p className="text-4xl font-bold text-primary">8</p>
                <span className="text-sm text-accent mt-2">↑ 1 new this month</span>
              </div>
            </GlassCard>
            
            <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100">
              <div className="flex flex-col">
                <h2 className="text-lg font-medium text-primary/80 mb-2">Today's Sessions</h2>
                <p className="text-4xl font-bold text-primary">5</p>
                <span className="text-sm text-accent mt-2">Next session in 2h</span>
              </div>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100 p-6">
              <h3 className="text-xl font-semibold text-primary mb-4">Upcoming Sessions</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium text-primary">Sarah Johnson</p>
                    <p className="text-sm text-muted-foreground">Strength Training</p>
                  </div>
                  <div className="text-right">
                    <p className="text-accent">2:00 PM</p>
                    <p className="text-sm text-muted-foreground">Today</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium text-primary">Mike Peters</p>
                    <p className="text-sm text-muted-foreground">HIIT Session</p>
                  </div>
                  <div className="text-right">
                    <p className="text-accent">4:30 PM</p>
                    <p className="text-sm text-muted-foreground">Today</p>
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100 p-6">
              <h3 className="text-xl font-semibold text-primary mb-4">Recent Activities</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-primary">New Program Created</p>
                    <p className="text-sm text-muted-foreground">Advanced Weight Loss - 12 Weeks</p>
                  </div>
                  <span className="text-sm text-muted-foreground">2h ago</span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-primary">Client Milestone</p>
                    <p className="text-sm text-muted-foreground">Emma reached her weight goal</p>
                  </div>
                  <span className="text-sm text-muted-foreground">1d ago</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
