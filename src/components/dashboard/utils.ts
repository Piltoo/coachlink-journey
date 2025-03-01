import { Measurement, HealthAssessment } from "./types";

export const calculateBodyFat = (
  latest: Measurement,
  healthAssessment: HealthAssessment
): number | null => {
  if (!latest || !latest.waist_cm || !latest.neck_cm || !healthAssessment?.height_cm) {
    console.log("Missing measurements:", {
      waist: latest?.waist_cm,
      neck: latest?.neck_cm,
      height: healthAssessment?.height_cm
    });
    return null;
  }

  const height = healthAssessment.height_cm;
  const waist = latest.waist_cm;
  const neck = latest.neck_cm;
  const gender = healthAssessment.gender || 'male';
  
  console.log("Calculating body fat with measurements:", {
    height,
    waist,
    neck,
    gender,
    hips: latest.hips_cm
  });

  let bodyFat: number;
  
  if (gender === 'male') {
    const waistNeckDiff = waist - neck;
    const logWaistNeck = Math.log10(waistNeckDiff);
    const logHeight = Math.log10(height);
    
    bodyFat = 86.010 * logWaistNeck - 70.041 * logHeight + 36.76;
    
    console.log("Male body fat calculation:", {
      waistNeckDiff,
      logWaistNeck,
      logHeight,
      result: bodyFat
    });
  } else {
    if (!latest.hips_cm) {
      console.log("Missing hips measurement for female calculation");
      return null;
    }
    const hips = latest.hips_cm;
    const waistHipsNeck = waist + hips - neck;
    const logWaistHipsNeck = Math.log10(waistHipsNeck);
    const logHeight = Math.log10(height);
    
    bodyFat = 163.205 * logWaistHipsNeck - 97.684 * logHeight - 78.387;
    
    console.log("Female body fat calculation:", {
      waistHipsNeck,
      logWaistHipsNeck,
      logHeight,
      result: bodyFat
    });
  }
  
  // Avrunda till en decimal utan att begränsa värdet
  const finalResult = Math.round(bodyFat * 10) / 10;
  console.log("Final body fat percentage:", finalResult);
  
  return finalResult;
};

export const calculateBMI = (weightKg: number | null, heightCm: number | null): number | null => {
  if (!weightKg || !heightCm) return null;
  const heightM = heightCm / 100;
  // Avrunda till en decimal
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
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
