
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ClientProfileCard } from "@/components/dashboard/ClientProfileCard";
import { ChevronLeft } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ClientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50 p-6">
      <div className="max-w-[1600px] mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/clients')}
          className="mb-6"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Clients
        </Button>

        <Tabs defaultValue="profile" className="mb-6">
          <TabsList className="bg-white/50 backdrop-blur-sm border">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition Plans</TabsTrigger>
            <TabsTrigger value="workout">Workout Plans</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="bg-white rounded-lg shadow-sm">
          {id && (
            <ClientProfileCard
              clientId={id}
              onUnsubscribe={() => navigate('/clients')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;
