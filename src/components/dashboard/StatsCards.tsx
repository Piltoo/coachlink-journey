
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { StatCard } from "./stats/StatCard";
import { TodaySessions } from "./stats/TodaySessions";
import { useStats } from "./stats/useStats";

export function StatsCards() {
  const navigate = useNavigate();
  const { stats, todaySessions, userRole } = useStats();

  if (userRole !== 'coach') return null;

  const handleNewArrivalsClick = () => {
    navigate('/new-arrivals');
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Left Side Stats - First Column */}
      <div className="space-y-4">
        <StatCard
          title="Active Clients"
          value={stats.activeClients.value}
          description={stats.activeClients.description}
        />
        <StatCard
          title="Pending Check-ins"
          value={stats.pendingCheckins.value}
          description={stats.pendingCheckins.description}
        />
        <StatCard
          title="Pending Sessions"
          value={0}
          description="No pending sessions"
        />
      </div>

      {/* Left Side Stats - Second Column */}
      <div className="space-y-4">
        <StatCard
          title="New Arrivals"
          value={stats.newArrivals.value}
          description={stats.newArrivals.description}
          icon={<UserPlus className="w-5 h-5 text-[#1B4332]" />}
          onClick={handleNewArrivalsClick}
        />
        <StatCard
          title="Unread Messages"
          value={stats.unreadMessages.value}
          description={stats.unreadMessages.description}
        />
        <StatCard
          title="Missed Payments"
          value={0}
          description="0 kr overdue"
        />
      </div>

      {/* Right Side - Today's Assignments (spans 2 columns) */}
      <div className="col-span-2">
        <TodaySessions sessions={todaySessions} />
      </div>
    </div>
  );
}
