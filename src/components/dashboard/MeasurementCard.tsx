
import { format } from "date-fns";
import { GlassCard } from "@/components/ui/glass-card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { MeasurementCard as MeasurementCardType, Measurement } from "./types";

type Props = {
  card: MeasurementCardType;
  measurements: Measurement[];
};

export const MeasurementCard = ({ card, measurements }: Props) => {
  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM');
  };

  const measurementData = measurements
    .filter(m => m[card.key] !== null)
    .map(m => ({
      value: m[card.key],
      date: formatDate(m.created_at)
    }));

  if (measurementData.length === 0) return null;

  return (
    <GlassCard 
      className="bg-white/40 backdrop-blur-lg border border-green-100"
    >
      <div className="flex flex-col space-y-4">
        <h2 className="text-lg font-medium text-primary/80">{card.title}</h2>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={measurementData}>
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                unit={card.unit}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={card.color}
                strokeWidth={2}
                dot={{ fill: card.color }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </GlassCard>
  );
};
