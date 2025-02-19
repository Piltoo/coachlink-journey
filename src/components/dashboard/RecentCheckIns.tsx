
import { GlassCard } from "@/components/ui/glass-card";
import { useNavigate } from "react-router-dom";

type CheckIn = {
  id: string;
  created_at: string;
  weight_kg: number;
  profiles: {
    full_name: string | null;
    email: string;
  };
};

interface RecentCheckInsProps {
  checkIns: CheckIn[];
}

export const RecentCheckIns = ({ checkIns }: RecentCheckInsProps) => {
  const navigate = useNavigate();

  const handleCheckInClick = (checkInId: string) => {
    navigate(`/check-ins/${checkInId}`);
  };

  return (
    <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100 p-6">
      <h3 className="text-xl font-semibold text-primary mb-4">Recent Client Check-ins</h3>
      <div className="space-y-4">
        {checkIns.map((checkIn) => (
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
  );
};
