
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { NavBar } from "@/components/navigation/nav-bar";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import Clients from "@/pages/Clients";
import ClientProfile from "@/pages/ClientProfile";
import Messages from "@/pages/Messages";
import NotFound from "@/pages/NotFound";
import NutritionAndTraining from "@/pages/NutritionAndTraining";
import Program from "@/pages/Program";
import NewArrivals from "@/pages/NewArrivals";
import CreateNutritionPlan from "@/pages/CreateNutritionPlan";
import CreateTrainingPlan from "@/pages/CreateTrainingPlan";
import HealthAssessment from "@/pages/HealthAssessment";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <NavBar />
          <div className="pt-16">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings/*" element={<Settings />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/clients/:id" element={<ClientProfile />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/new-arrivals" element={<NewArrivals />} />
              <Route path="/nutrition-and-training/*" element={<NutritionAndTraining />} />
              <Route path="/nutrition-and-training/create-nutrition-plan" element={<CreateNutritionPlan />} />
              <Route path="/nutrition-and-training/create-nutrition-plan/:planId" element={<CreateNutritionPlan />} />
              <Route path="/nutrition-and-training/create-training-plan" element={<CreateTrainingPlan />} />
              <Route path="/nutrition-training/*" element={<Navigate to="/nutrition-and-training" replace />} />
              <Route path="/program/:programId" element={<Program />} />
              <Route path="/health-assessment" element={<HealthAssessment />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
