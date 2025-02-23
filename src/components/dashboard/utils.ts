
import { Measurement, HealthAssessment } from "./types";

export const calculateBodyFat = (
  latest: Measurement,
  healthAssessment: HealthAssessment
): number | null => {
  if (!latest || !latest.waist_cm || !latest.neck_cm || !healthAssessment?.height_cm) {
    return null;
  }

  const height = healthAssessment.height_cm;
  const waist = latest.waist_cm;
  const neck = latest.neck_cm;
  const gender = healthAssessment.gender || 'male';
  
  let bodyFat: number;
  
  if (gender === 'male') {
    bodyFat = 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
  } else {
    if (!latest.hips_cm) {
      return null;
    }
    const hips = latest.hips_cm;
    bodyFat = 163.205 * Math.log10(waist + hips - neck) - 97.684 * Math.log10(height) - 78.387;
  }
  
  return Math.min(Math.max(Math.round(bodyFat * 10) / 10, 2), 45);
};

export const calculateProgress = (current: number, initial: number, target: number) => {
  if (initial === target) return 100;
  return Math.min(100, Math.max(0, 
    ((initial - current) / (initial - target)) * 100
  ));
};

export const getHealthyRangeText = (gender: 'male' | 'female') => {
  return gender === 'male' 
    ? "En hälsosam kroppsfettsprocent för män är mellan 8-19%"
    : "En hälsosam kroppsfettsprocent för kvinnor är mellan 21-33%";
};
