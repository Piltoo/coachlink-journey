
import { Card, CardContent } from "@/components/ui/card";

const MyNutritionPlan = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-primary mb-6">My Nutrition Plan</h1>
        <Card className="bg-white/40 backdrop-blur-lg border border-green-100">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Your nutrition plan will appear here once your trainer creates it.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyNutritionPlan;
