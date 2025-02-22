
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NavBar } from "@/components/navigation/nav-bar";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import Clients from "@/pages/Clients";
import Messages from "@/pages/Messages";
import NotFound from "@/pages/NotFound";
import NutritionAndTraining from "@/pages/NutritionAndTraining";
import Program from "@/pages/Program";
import WaitingList from "@/pages/WaitingList";

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
              <Route path="/messages" element={<Messages />} />
              <Route path="/nutrition-and-training" element={<NutritionAndTraining />} />
              <Route path="/program/:programId" element={<Program />} />
              <Route path="/waiting-list" element={<WaitingList />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
