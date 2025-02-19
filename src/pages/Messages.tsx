
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { MessageList } from "@/components/messages/MessageList";
import { MessageInput } from "@/components/messages/MessageInput";
import { ClientSelect } from "@/components/messages/ClientSelect";

type Profile = {
  id: string;
  full_name: string | null;
  email: string;
};

type Message = {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  status: 'sent' | 'delivered' | 'read';
};

export default function Messages() {
  const [selectedClient, setSelectedClient] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [clients, setClients] = useState<Profile[]>([]);
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndClients = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

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

      setClients(clientsData);
    };

    fetchUserAndClients();
  }, []);

  useEffect(() => {
    if (!selectedClient) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .or(`sender_id.eq.${selectedClient.id},receiver_id.eq.${selectedClient.id}`)
        .order('created_at', { ascending: true });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
        return;
      }

      setMessages(data);
    };

    fetchMessages();

    // Set up real-time subscription
    const channel = supabase
      .channel('messages_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${selectedClient.id},receiver_id=eq.${userId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedClient, userId]);

  const handleSendMessage = async (content: string) => {
    if (!selectedClient || !content.trim() || !userId) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        content,
        sender_id: userId,
        receiver_id: selectedClient.id,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-primary">Messages</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="md:col-span-1 p-4 bg-white/40 backdrop-blur-lg border border-green-100">
              <ClientSelect
                clients={clients}
                selectedClient={selectedClient}
                onSelect={setSelectedClient}
              />
            </Card>
            
            <Card className="md:col-span-3 p-4 bg-white/40 backdrop-blur-lg border border-green-100">
              {selectedClient ? (
                <div className="flex flex-col h-[600px]">
                  <div className="border-b pb-4 mb-4">
                    <h2 className="text-lg font-semibold">
                      {selectedClient.full_name || selectedClient.email}
                    </h2>
                  </div>
                  <MessageList messages={messages} currentUserId={userId} />
                  <MessageInput onSendMessage={handleSendMessage} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-[600px] text-muted-foreground">
                  Select a client to start messaging
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
