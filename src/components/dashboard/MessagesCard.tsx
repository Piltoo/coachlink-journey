
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const MessagesCard = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadMessages = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // TODO: Replace with actual messages query once message table is created
      setUnreadCount(3); // Temporary mock data
    };

    fetchUnreadMessages();
  }, []);

  return (
    <Card className="bg-white/40 backdrop-blur-lg border border-blue-100">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-primary/80 flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Unread Messages
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-2xl font-bold text-primary">
            {unreadCount}
            <span className="text-sm font-normal text-muted-foreground ml-2">unread messages</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
