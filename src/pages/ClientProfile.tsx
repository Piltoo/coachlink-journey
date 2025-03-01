import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Progress } from "@/components/ui/progress"
import { ListDemo } from '@/components/ui/list-demo';
import { GlassCard } from '@/components/ui/glass-card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/components/clients/types';
import { calculateWeightLossProgress, calculateWeightGainProgress } from '@/utils/progress-calculations';

interface Note {
  id: string;
  content: string;
  created_at: string;
}

interface HealthAssessment {
  starting_weight: number | null;
  target_weight: number | null;
  height_cm: number | null;
  gender: string | null;
}

interface Measurement {
  weight_kg: number | null;
  created_at: string;
}

export default function ClientProfile() {
  const [client, setClient] = useState<Client | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteContent, setNoteContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [clientHealth, setClientHealth] = useState<HealthAssessment | null>(null);
  const [latestMeasurement, setLatestMeasurement] = useState<Measurement | null>(null);
  const { toast } = useToast();
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (clientId) {
      fetchClientData(clientId);
      fetchNotes(clientId);
      fetchClientHealth(clientId);
      fetchLatestMeasurement(clientId);
    }
  }, [clientId]);

  const fetchClientData = async (clientId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) throw error;
      setClient(data);
    } catch (error) {
      console.error('Error fetching client data:', error);
      toast({
        title: "Error",
        description: "Failed to load client data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotes = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('client_notes')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Error",
        description: "Failed to load notes",
        variant: "destructive",
      });
    }
  };

  const addNote = async (content: string) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('client_notes')
        .insert([{ client_id: clientId, content }])
        .select()
        .single();

      if (error) throw error;

      setNotes([data, ...notes]);
      setNoteContent('');
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('client_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      setNotes(notes.filter(note => note.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchClientHealth = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('client_health_assessments')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setClientHealth(data);
    } catch (error) {
      console.error('Error fetching client health:', error);
      toast({
        title: "Error",
        description: "Failed to load client health data",
        variant: "destructive",
      });
    }
  };

  const fetchLatestMeasurement = async (clientId: string) => {
    try {
      // Fetch the latest check-in for the client
      const { data: checkinData, error: checkinError } = await supabase
        .from('weekly_checkins')
        .select('id, created_at')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (checkinError) throw checkinError;

      if (checkinData) {
        // Fetch the measurement associated with the latest check-in
        const { data: measurementData, error: measurementError } = await supabase
          .from('measurements')
          .select('weight_kg, created_at')
          .eq('checkin_id', checkinData.id)
          .single();

        if (measurementError) throw measurementError;

        setLatestMeasurement(measurementData || null);
      } else {
        setLatestMeasurement(null);
      }
    } catch (error) {
      console.error('Error fetching latest measurement:', error);
      toast({
        title: "Error",
        description: "Failed to load latest measurement",
        variant: "destructive",
      });
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    addNote(noteContent);
  };

  const calculateProgress = () => {
    if (!clientHealth) return 0;
    
    const startWeight = typeof clientHealth.starting_weight === 'string' 
      ? parseFloat(clientHealth.starting_weight) 
      : (clientHealth.starting_weight || 0);
      
    const targetWeight = typeof clientHealth.target_weight === 'string' 
      ? parseFloat(clientHealth.target_weight) 
      : (clientHealth.target_weight || 0);
      
    const currentWeight = latestMeasurement?.weight_kg || 0;
    
    return startWeight > targetWeight 
      ? calculateWeightLossProgress(startWeight, currentWeight, targetWeight)
      : calculateWeightGainProgress(startWeight, currentWeight, targetWeight);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!client) {
    return <div>Client not found.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <Button onClick={() => navigate('/clients')}>Back to Clients</Button>
        <h1 className="text-2xl font-bold">{client.full_name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Client Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <Avatar>
                <AvatarImage src={`https://avatar.vercel.sh/${client.full_name}.png`} />
                <AvatarFallback>{client.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium">{client.full_name}</div>
                <div className="text-muted-foreground">{client.email}</div>
              </div>
            </div>
            <ListDemo />
          </CardContent>
        </Card>

        {/* Progress Tracking Card */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {clientHealth ? (
              <>
                <div className="space-y-2">
                  <Label>Weight Progress</Label>
                  <Progress value={calculateProgress()} />
                  <p className="text-sm text-muted-foreground">
                    {calculateProgress()}% towards goal
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GlassCard>
                    <p>Start Weight: {clientHealth?.starting_weight} kg</p>
                  </GlassCard>
                  <GlassCard>
                    <p>Target Weight: {clientHealth?.target_weight} kg</p>
                  </GlassCard>
                  <GlassCard>
                    <p>Latest Weight: {latestMeasurement?.weight_kg} kg</p>
                  </GlassCard>
                  <GlassCard>
                    <p>Height: {clientHealth?.height_cm} cm</p>
                  </GlassCard>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">No health assessment found for this client.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 mt-6">
        {/* Notes Section */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddNote} className="mb-4">
              <div className="grid gap-2">
                <Label htmlFor="note">Add a note</Label>
                <Textarea
                  id="note"
                  placeholder="Enter your note here"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                />
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting ? 'Adding...' : 'Add Note'}
                </Button>
              </div>
            </form>
            <div>
              {notes.length > 0 ? (
                <ul className="space-y-2">
                  {notes.map((note) => (
                    <li key={note.id} className="border rounded-md p-4">
                      <div className="flex items-center justify-between">
                        <p>{note.content}</p>
                        <div className="flex space-x-2">
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => deleteNote(note.id)}
                            disabled={isSubmitting}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-trash"
                            >
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(note.created_at), "PPP")}
                        </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No notes yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
