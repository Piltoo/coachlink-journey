
import { useEffect, useRef } from "react";

type Message = {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
};

interface MessageListProps {
  messages: Message[];
  currentUserId: string | null;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[80%] px-4 py-2 rounded-lg ${
              message.sender_id === currentUserId
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            }`}
          >
            <p className="text-sm">{message.content}</p>
            <span className="text-xs opacity-70">
              {new Date(message.created_at).toLocaleTimeString()}
            </span>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
