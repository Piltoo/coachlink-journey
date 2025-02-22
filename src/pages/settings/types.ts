
export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  currency: string;
  interval: string;
  active: boolean;
};

export type NewPlan = {
  name: string;
  description: string;
  amount: number;
  interval: string;
};
