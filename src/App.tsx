
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;
