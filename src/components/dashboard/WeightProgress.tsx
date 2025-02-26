
import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { HealthAssessment } from "./types";
import { calculateProgress, getHealthyRangeText, calculateBMI } from "./utils";

type Props = {
  currentWeight: number;
  healthAssessment: HealthAssessment;
  bodyFatPercentage: number | null;
};

export const WeightProgress = ({ 
  currentWeight, 
  healthAssessment, 
  bodyFatPercentage 
}: Props) => {
  const [showBodyFat, setShowBodyFat] = useState(false);
  const [showBMI, setShowBMI] = useState(false);
  
  const weightProgress = calculateProgress(
    currentWeight,
    healthAssessment.starting_weight,
    healthAssessment.target_weight
  );

  const bmi = healthAssessment?.height_cm ? calculateBMI(currentWeight, healthAssessment.height_cm) : null;

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return "Undervikt";
    if (bmi < 25) return "Normalvikt";
    if (bmi < 30) return "Övervikt";
    return "Fetma";
  };

  return (
    <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100">
      <div className="flex flex-col space-y-4">
        <h2 className="text-lg font-medium text-primary/80">Viktframsteg</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Nuvarande: {currentWeight}kg</span>
            <span>Mål: {healthAssessment?.target_weight}kg</span>
          </div>
          <Progress value={weightProgress} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {weightProgress.toFixed(1)}% framsteg mot målet
          </p>
          
          <div className="flex flex-col space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-body-fat"
                  checked={showBodyFat}
                  onCheckedChange={setShowBodyFat}
                />
                <label 
                  htmlFor="show-body-fat" 
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Visa kroppsfettsanalys
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-bmi"
                  checked={showBMI}
                  onCheckedChange={setShowBMI}
                />
                <label 
                  htmlFor="show-bmi" 
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Visa BMI
                </label>
              </div>
            </div>
          </div>

          {showBodyFat && bodyFatPercentage && healthAssessment?.gender && (
            <div className="mt-4 p-3 bg-green-50 rounded-md">
              <h3 className="text-sm font-medium text-primary/80 mb-1">Uppskattad kroppsfett</h3>
              <p className="text-2xl font-bold text-primary">
                {bodyFatPercentage}%
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {getHealthyRangeText(healthAssessment.gender)}
              </p>
            </div>
          )}

          {showBMI && bmi && (
            <div className="mt-4 p-3 bg-green-50 rounded-md">
              <h3 className="text-sm font-medium text-primary/80 mb-1">BMI</h3>
              <p className="text-2xl font-bold text-primary">
                {bmi.toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Kategori: {getBMICategory(bmi)}
              </p>
              <p className="text-xs text-muted-foreground">
                Ett hälsosamt BMI ligger mellan 18.5 och 24.9
              </p>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
};
