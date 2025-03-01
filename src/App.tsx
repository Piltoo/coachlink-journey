import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import MyTrainingPlans from './pages/client/MyTrainingPlans';
import CreateNutritionPlan from './pages/CreateNutritionPlan';
import Auth from './pages/Auth';
import NutritionAndTraining from './pages/NutritionAndTraining';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/nutrition-and-training" element={<NutritionAndTraining />} />
          <Route path="/my-training-plans" element={<MyTrainingPlans />} />
          <Route path="/create-nutrition-plan" element={<CreateNutritionPlan />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
