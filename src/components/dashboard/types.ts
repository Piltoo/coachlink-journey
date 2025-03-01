export interface Measurement {
  id?: string;
  created_at?: string;
  weight_kg?: number;
  chest_cm?: number;
  waist_cm?: number;
  hips_cm?: number;
  thigh_cm?: number;
  arm_cm?: number;
  neck_cm?: number;
  front_photo_url?: string;
  side_photo_url?: string;
  back_photo_url?: string;
  checkin_id?: string;
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
