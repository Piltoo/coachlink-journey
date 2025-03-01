export interface Measurement {
  id?: string;
  created_at: string;
  neck_cm: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  hips_cm: number | null;
  thigh_cm: number | null;
  arm_cm: number | null;
  front_photo_url?: string | null;
  side_photo_url?: string | null;
  back_photo_url?: string | null;
}

export interface CheckIn {
  id: string;
  created_at: string;
  weight_kg: number;
  client_id: string;
  measurements: Measurement | null;
  bmi: number | null;
  bodyFat: number | null;
}

export type HealthAssessment = {
  target_weight: number;
  starting_weight: number;
  height_cm: number;
  gender: 'male' | 'female';
};

export type MeasurementCard = {
  title: string;
  key: keyof Omit<Measurement, 'created_at' | 'id' | 'front_photo_url' | 'side_photo_url' | 'back_photo_url'>;
  unit: string;
  color: string;
};
