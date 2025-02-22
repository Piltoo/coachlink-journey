
import { GlassCard } from "@/components/ui/glass-card";

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  prefix?: string;
}

export function StatCard({ 
  title, 
  value, 
  description, 
  icon, 
  onClick,
  prefix 
}: StatCardProps) {
  return (
    <GlassCard 
      className={`p-4 ${onClick ? 'cursor-pointer transition-all hover:shadow-md hover:bg-green-50/50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {icon}
      </div>
      <p className="text-4xl font-bold text-[#1B4332]">
        {prefix}{value}
      </p>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </GlassCard>
  );
}
