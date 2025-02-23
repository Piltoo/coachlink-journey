
export type Measurement = {
  weight_kg: number | null;
  waist_cm: number | null;
  chest_cm: number | null;
  hips_cm: number | null;
  thigh_cm: number | null;
  arm_cm: number | null;
  created_at: string;
  neck_cm?: number | null;
};

export type HealthAssessment = {
  target_weight: number;
  starting_weight: number;
  height_cm?: number;
  gender?: 'male' | 'female';
};

export type MeasurementCard = {
  title: string;
  key: keyof Omit<Measurement, 'created_at'>;
  unit: string;
  color: string;
};
