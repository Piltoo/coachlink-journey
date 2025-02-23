
import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { HealthAssessment } from "./types";
import { calculateProgress, getHealthyRangeText } from "./utils";

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
  
  const weightProgress = calculateProgress(
    currentWeight,
    healthAssessment.starting_weight,
    healthAssessment.target_weight
  );

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
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="show-body-fat"
              checked={showBodyFat}
              onCheckedChange={(checked) => setShowBodyFat(checked as boolean)}
            />
            <label 
              htmlFor="show-body-fat" 
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Visa kroppsfettsanalys
            </label>
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
        </div>
      </div>
    </GlassCard>
  );
};
