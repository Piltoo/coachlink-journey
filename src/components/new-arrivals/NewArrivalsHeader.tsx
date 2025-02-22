
import { Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface NewArrivalsHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const NewArrivalsHeader = ({ searchTerm, onSearchChange }: NewArrivalsHeaderProps) => {
  return (
    <>
      <div className="flex items-center">
        <div className="flex items-center gap-2">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-primary">New Arrivals</h1>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    </>
  );
};
