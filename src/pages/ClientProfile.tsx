import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ChevronLeft, UserX, Mail, User, Key, Scale, Activity, Heart, AreaChart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const ClientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [healthAssessment, setHealthAssessment] = useState(null);
  const [checkIns, setCheckIns] = useState([]);
  const [clientProfile, setClientProfile] = useState<{
    full_name?: string;
    email?: string;
    has_completed_assessment?: boolean;
  } | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  useEffect(() => {
    const fetchClientData = async () => {
      if (!id) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, email, has_completed_assessment')
        .eq('id', id)
        .single();

      if (profileData) {
        setClientProfile(profileData);
      }

      const { data: assessmentData } = await supabase
        .from('client_health_assessments')
        .select('*')
        .eq('client_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (assessmentData) {
        setHealthAssessment(assessmentData);
      }

      const { data: checkInsData } = await supabase
        .from('weekly_checkins')
        .select(`
          *,
          measurements (*)
        `)
        .eq('client_id', id)
        .order('created_at', { ascending: false });

      if (checkInsData) {
        setCheckIns(checkInsData);
      }
    };

    fetchClientData();
  }, [id]);

  const handleUnsubscribe = async () => {
    if (!id) return;
    
    const { error } = await supabase
      .from('coach_clients')
      .update({ status: 'inactive' })
      .eq('client_id', id);

    if (!error) {
      navigate('/clients');
    }
  };

  const handlePasswordReset = async () => {
    if (!clientProfile?.email) {
      toast({
        title: "Error",
        description: "Client email not found",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsResettingPassword(true);
      const { error } = await supabase.auth.resetPasswordForEmail(
        clientProfile.email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password reset email has been sent to the client",
      });
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send password reset email",
        variant: "destructive",
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

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
            <TabsTrigger value="healthAssessment">Health Assessment</TabsTrigger>
            <TabsTrigger value="checkIns">Check-ins</TabsTrigger>
            <TabsTrigger value="nutritionPlan">Nutrition Plan</TabsTrigger>
            <TabsTrigger value="trainingPlan">Training Plan</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Name:</span>
                    <span>{clientProfile?.full_name || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                    <span>{clientProfile?.email || 'Not provided'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="healthAssessment" className="space-y-6">
            {healthAssessment ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Physical Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Starting Weight</p>
                      <p className="text-lg font-medium">{healthAssessment.starting_weight} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Target Weight</p>
                      <p className="text-lg font-medium">{healthAssessment.target_weight} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Height</p>
                      <p className="text-lg font-medium">{healthAssessment.height_cm} cm</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Activity Level</p>
                      <p className="text-lg font-medium">{healthAssessment.current_activity_level}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Health Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Health Goals</p>
                      <p className="mt-1">{healthAssessment.health_goals}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Medical Conditions</p>
                      <p className="mt-1">{healthAssessment.medical_conditions || 'None reported'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Dietary Restrictions</p>
                      <p className="mt-1">{healthAssessment.dietary_restrictions || 'None reported'}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Lifestyle Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Exercise Experience</p>
                      <p className="mt-1">{healthAssessment.previous_exercise_experience}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Gym Equipment Access</p>
                      <p className="mt-1">{healthAssessment.gym_equipment_access}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sleep Patterns</p>
                      <p className="mt-1">{healthAssessment.sleep_patterns}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Stress Levels</p>
                      <p className="mt-1">{healthAssessment.stress_levels}</p>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-6 text-center text-muted-foreground">
                  No health assessment data available.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="checkIns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Latest Check-in</CardTitle>
              </CardHeader>
              <CardContent>
                {checkIns[0] ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {format(new Date(checkIns[0].created_at), 'PPP')}
                      </p>
                    </div>
                    {checkIns[0].measurements && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Weight</p>
                          <p className="font-medium">{checkIns[0].weight_kg} kg</p>
                        </div>
                        {checkIns[0].measurements.neck_cm && (
                          <div>
                            <p className="text-sm text-muted-foreground">Neck</p>
                            <p className="font-medium">{checkIns[0].measurements.neck_cm} cm</p>
                          </div>
                        )}
                        {checkIns[0].measurements.chest_cm && (
                          <div>
                            <p className="text-sm text-muted-foreground">Chest</p>
                            <p className="font-medium">{checkIns[0].measurements.chest_cm} cm</p>
                          </div>
                        )}
                        {checkIns[0].measurements.waist_cm && (
                          <div>
                            <p className="text-sm text-muted-foreground">Waist</p>
                            <p className="font-medium">{checkIns[0].measurements.waist_cm} cm</p>
                          </div>
                        )}
                        {checkIns[0].measurements.hips_cm && (
                          <div>
                            <p className="text-sm text-muted-foreground">Hips</p>
                            <p className="font-medium">{checkIns[0].measurements.hips_cm} cm</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No check-in data available</p>
                )}
              </CardContent>
            </Card>

            {checkIns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Check-in History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {checkIns.map((checkIn) => (
                      <div key={checkIn.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium">
                            {format(new Date(checkIn.created_at), 'PPP')}
                          </h4>
                          <span className="text-sm text-muted-foreground">
                            Weight: {checkIn.weight_kg} kg
                          </span>
                        </div>
                        {checkIn.measurements && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {checkIn.measurements.neck_cm && (
                              <div>
                                <p className="text-sm text-muted-foreground">Neck</p>
                                <p>{checkIn.measurements.neck_cm} cm</p>
                              </div>
                            )}
                            {checkIn.measurements.chest_cm && (
                              <div>
                                <p className="text-sm text-muted-foreground">Chest</p>
                                <p>{checkIn.measurements.chest_cm} cm</p>
                              </div>
                            )}
                            {checkIn.measurements.waist_cm && (
                              <div>
                                <p className="text-sm text-muted-foreground">Waist</p>
                                <p>{checkIn.measurements.waist_cm} cm</p>
                              </div>
                            )}
                            {checkIn.measurements.hips_cm && (
                              <div>
                                <p className="text-sm text-muted-foreground">Hips</p>
                                <p>{checkIn.measurements.hips_cm} cm</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="nutritionPlan" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Nutrition Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate(`/nutrition-and-training?client=${id}&tab=nutrition`)}
                  className="w-full"
                >
                  View Nutrition Plans
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trainingPlan" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Training Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate(`/nutrition-and-training?client=${id}&tab=training`)}
                  className="w-full"
                >
                  View Training Plans
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handlePasswordReset}
                    disabled={isResettingPassword}
                  >
                    <Key className="w-4 h-4 mr-2" />
                    {isResettingPassword ? 'Sending Reset Email...' : 'Send Password Reset Email'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleUnsubscribe}
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    Unsubscribe Client
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientProfile;
