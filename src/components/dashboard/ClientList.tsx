
import { GlassCard } from "@/components/ui/glass-card";
import { useNavigate } from "react-router-dom";

type Client = {
  id: string;
  full_name: string | null;
  email: string;
  status: string;
};

interface ClientListProps {
  clients: Client[];
}

export const ClientList = ({ clients }: ClientListProps) => {
  const navigate = useNavigate();

  const handleClientClick = (clientId: string) => {
    navigate(`/clients/${clientId}`);
  };

  return (
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
  );
};
