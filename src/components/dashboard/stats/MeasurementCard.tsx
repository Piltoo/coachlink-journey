
import { GlassCard } from "@/components/ui/glass-card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Ruler } from "lucide-react";

type MeasurementData = {
  value: number | null;
  date: string;
};

type MeasurementCardProps = {
  title: string;
  data: MeasurementData[];
};

export const MeasurementCard = ({ title, data }: MeasurementCardProps) => {
  return (
    <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100">
      <div className="flex flex-col h-[150px]">
        <div className="flex items-center gap-2 mb-1">
          <Ruler className="w-4 h-4 text-primary/80" />
          <h2 className="text-sm font-medium text-primary/80">{title}</h2>
        </div>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 10 }}
                domain={['auto', 'auto']}
                width={25}
              />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#2D6A4F" 
                fill="#95D5B2" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-muted-foreground">No measurement data recorded</p>
        )}
      </div>
    </GlassCard>
  );
};
