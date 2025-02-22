
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { UserCheck, UserX } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type PendingClientCardProps = {
  client: {
    id: string;
    full_name: string | null;
    email: string;
    requested_services: string[];
  };
  onApprove: (clientId: string) => void;
  onReject: (clientId: string) => void;
};

export function PendingClientCard({ client, onApprove, onReject }: PendingClientCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-white/50">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {client.full_name || 'Unnamed Client'}
            </h3>
            <p className="text-sm text-gray-500">{client.email}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50"
              onClick={() => onApprove(client.id)}
            >
              <UserCheck className="w-4 h-4 mr-1" />
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
              onClick={() => onReject(client.id)}
            >
              <UserX className="w-4 h-4 mr-1" />
              Reject
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="bg-white/30">
        <div className="mt-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Requested Services:</h4>
          <div className="flex flex-wrap gap-2">
            {client.requested_services && client.requested_services.length > 0 ? (
              client.requested_services.map((service, index) => (
                <Badge key={index} variant="secondary" className="bg-green-100/50">
                  {service}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-gray-500">No specific services requested</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
