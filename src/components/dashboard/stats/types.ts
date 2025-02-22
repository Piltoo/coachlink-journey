
export type Stats = {
  activeClients: { value: number; description: string };
  pendingCheckins: { value: number; description: string };
  unreadMessages: { value: number; description: string };
  newArrivals: { value: number; description: string };
  totalSales: { value: number; description: string };
};

export type TodaySession = {
  start_time: string;
  client: {
    full_name: string | null;
    email: string;
  };
};
