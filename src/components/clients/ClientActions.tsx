
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, UserX, UserCheck, Trash2 } from "lucide-react";

interface ClientActionsProps {
  clientId: string;
  status: string;
  onViewProfile: (clientId: string) => void;
  onStatusChange: (clientId: string, status: string) => void;
  onDelete: (clientId: string) => void;
}

export function ClientActions({ 
  clientId, 
  status, 
  onViewProfile, 
  onStatusChange, 
  onDelete 
}: ClientActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onViewProfile(clientId)}>
          View Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {status === 'active' ? (
          <DropdownMenuItem 
            onClick={() => onStatusChange(clientId, 'inactive')}
            className="text-yellow-600"
          >
            <UserX className="w-4 h-4 mr-2" />
            Make Inactive
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem 
            onClick={() => onStatusChange(clientId, 'active')}
            className="text-green-600"
          >
            <UserCheck className="w-4 h-4 mr-2" />
            Make Active
          </DropdownMenuItem>
        )}
        <DropdownMenuItem 
          onClick={() => onDelete(clientId)}
          className="text-red-600"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Client
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
