import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ChevronLeft, UserX, Mail, User, Key, RotateCcw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { MeasurementCard } from "@/components/dashboard/MeasurementCard";
import type { Measurement } from "@/components/dashboard/types";
import { calculateBodyFat, calculateBMI } from "@/components/dashboard/utils";
import { Image } from "lucide-react";
import { useDeleteClient } from "@/components/clients/useDeleteClient";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const getGymEquipmentText = (value: string) => {
  const options = {
    "1": "1 - Kroppsvikt/hemmagym",
    "2": "2 - Grundläggande utrustning",
    "3": "3 - Standard gymutrustning",
    "4": "4 - Välutrustad anläggning",
    "5": "5 - Toppanläggning med stor variation på maskiner"
  };
  return options[value] || value;
};

const getStressLevelText = (value: string) => {
  const options = {
    "1": "1 - God möjlighet till återhämtning",
    "2": "2 - Periodvis begränsad återhämtning",
    "3": "3 - Mycket begränsad återhämtning"
  };
  return options[value] || value;
};

const getActivityLevelText = (value: string) => {
  const options = {
    "sedentary": "Stillasittande",
    "light": "Lätt aktiv",
    "moderate": "Måttligt aktiv",
    "very": "Mycket aktiv",
    "extra": "Extra aktiv"
  };
  return options[value] || value;
};

const ClientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [healthAssessment, setHealthAssessment] = useState(null);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [clientProfile, setClientProfile] = useState<{
    full_name?: string;
    email?: string;
    has_completed_assessment?: boolean;
    status?: string;
  } | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { deleteClient } = useDeleteClient(() => {
    // Efter borttagning, navigera till clients sidan
    navigate('/clients');
  });

  const measurementCards = [
    {
      title: "Vikt",
      key: "weight_kg" as const,
      color: "#2D6A4F",
      unit: "kg"
    },
    {
      title: "Nacke",
      key: "neck_cm" as const,
      color: "#40916C",
      unit: "cm"
    },
    {
      title: "Bröst",
      key: "chest_cm" as const,
      color: "#52B788",
      unit: "cm"
    },
    {
      title: "Midja",
      key: "waist_cm" as const,
      color: "#74C69D",
      unit: "cm"
    },
    {
      title: "Höfter",
      key: "hips_cm" as const,
      color: "#95D5B2",
      unit: "cm"
    },
    {
      title: "Lår",
      key: "thigh_cm" as const,
      color: "#B7E4C7",
      unit: "cm"
    },
    {
      title: "Arm",
      key: "arm_cm" as const,
      color: "#D8F3DC",
      unit: "cm"
    }
  ];

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast({
            title: "Error",
            description: "You must be logged in to view client data",
            variant: "destructive",
          });
          return;
        }

        // First verify the coach-client relationship
        const { data: coachClientData, error: coachClientError } = await supabase
          .from('coach_clients')
          .select('status')
          .eq('coach_id', user.id)
          .eq('client_id', id)
          .single();

        if (coachClientError || !coachClientData) {
          toast({
            title: "Error",
            description: "You don't have permission to view this client's data",
            variant: "destructive",
          });
          return;
        }

        // Now fetch the check-ins data
        const { data: checkInsData, error: checkInsError } = await supabase
          .from('weekly_checkins')
          .select(`
            id,
            created_at,
            weight_kg,
            client_id
          `)
          .eq('client_id', id)
          .order('created_at', { ascending: false });

        if (checkInsError) {
          console.error('Error fetching check-ins:', checkInsError);
          toast({
            title: "Error",
            description: "Failed to fetch check-in data",
            variant: "destructive",
          });
          return;
        }

        // Fetch measurements data
        const { data: measurementsData, error: measurementsError } = await supabase
          .from('measurements')
          .select(`
            *,
            weekly_checkins!inner (
              created_at,
              client_id
            )
          `)
          .eq('weekly_checkins.client_id', id)
          .order('weekly_checkins.created_at', { ascending: false });

        if (measurementsError) {
          console.error('Error fetching measurements:', measurementsError);
          toast({
            title: "Error",
            description: "Failed to fetch measurements data",
            variant: "destructive",
          });
          return;
        }

        console.log('Raw check-ins data:', checkInsData);
        console.log('Raw measurements data:', measurementsData);

        if (checkInsData) {
          setCheckIns(checkInsData);
        }

        if (measurementsData) {
          setMeasurements(measurementsData);
        }

        // Fetch health assessment data
        const { data: healthData, error: healthError } = await supabase
          .from('client_health_assessments')
          .select('*')
          .eq('client_id', id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (healthError) {
          console.error('Error fetching health assessment:', healthError);
          toast({
            title: "Error",
            description: "Failed to fetch health assessment data",
            variant: "destructive",
          });
        } else {
          console.log('Health assessment data:', healthData);
          setHealthAssessment(healthData);
        }

        // Fetch client profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, email, has_completed_assessment')
          .eq('id', id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          toast({
            title: "Error",
            description: "Failed to fetch profile data",
            variant: "destructive",
          });
          return;
        }

        if (profileData) {
          setClientProfile(profileData);
        }

        // Fetch coach-client relationship data
        const { data: coachClientRelationshipData, error: coachClientRelationshipError } = await supabase
          .from('coach_clients')
          .select('status')
          .eq('client_id', id)
          .eq('coach_id', user.id)
          .single();

        if (coachClientRelationshipError) {
          console.error('Error fetching coach-client relationship:', coachClientRelationshipError);
        } else if (coachClientRelationshipData) {
          setClientProfile(prev => ({
            ...prev!,
            status: coachClientRelationshipData.status
          }));
        }

      } catch (error: any) {
        console.error('Error in fetchClientData:', error);
        toast({
          title: "Error",
          description: "Failed to fetch client data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();
  }, [id, toast]);

  const getBodyFatTrend = () => {
    if (!checkIns || !healthAssessment) return [];
    
    return checkIns
      .filter(checkIn => checkIn.measurements)
      .map(checkIn => {
        const bodyFat = calculateBodyFat(
          healthAssessment.gender,
          {
            weight_kg: checkIn.weight_kg,
            ...checkIn.measurements
          },
          healthAssessment.height_cm
        );
        return {
          date: format(new Date(checkIn.created_at), 'yyyy-MM-dd'),
          bodyFat: bodyFat
        };
      })
      .filter(item => item.bodyFat !== null)
      .reverse();
  };

  const bodyFatTrend = getBodyFatTrend();
  const latestBodyFat = bodyFatTrend[0]?.bodyFat;

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to perform this action",
          variant: "destructive",
        });
        return;
      }

      // Uppdatera status i coach_clients tabellen
      const { error: updateError } = await supabase
        .from('coach_clients')
        .update({ status: newStatus })
        .eq('client_id', id)
        .eq('coach_id', user.id);

      if (updateError) throw updateError;

      // Hämta den uppdaterade statusen för att bekräfta ändringen
      const { data: updatedStatus, error: fetchError } = await supabase
        .from('coach_clients')
        .select('status')
        .eq('client_id', id)
        .eq('coach_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      // Uppdatera state med den bekräftade statusen
      setClientProfile(prev => ({
        ...prev!,
        status: updatedStatus.status
      }));
      
      toast({
        title: "Success",
        description: `Client is now ${updatedStatus.status}`,
      });
    } catch (error: any) {
      console.error("Error updating client status:", error);
      toast({
        title: "Error",
        description: "Failed to update client status: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleUnsubscribe = () => handleStatusChange('inactive');
  const handleActivate = () => handleStatusChange('active');

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

  const handleReturnToNewArrivals = async () => {
    if (!id) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to perform this action",
          variant: "destructive",
        });
        return;
      }

      // Uppdatera status till 'not_connected'
      const { error } = await supabase
        .from('coach_clients')
        .update({ status: 'not_connected' })
        .eq('coach_id', user.id)
        .eq('client_id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Client returned to New Arrivals",
      });

      // Navigera till New Arrivals
      navigate('/new-arrivals');
    } catch (error: any) {
      console.error("Error returning client:", error);
      toast({
        title: "Error",
        description: "Failed to return client: " + error.message,
        variant: "destructive",
      });
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
          Tillbaka till klienter
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
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Viktmål & Framsteg</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Startvikt</p>
                        <p className="mt-1">{healthAssessment.starting_weight} kg</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Målvikt</p>
                        <p className="mt-1">{healthAssessment.target_weight} kg</p>
                      </div>
                      {checkIns.length > 0 && (
                        <>
                          <div>
                            <p className="text-sm text-muted-foreground">Nuvarande vikt</p>
                            <p className="mt-1">{checkIns[0].weight_kg} kg</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total viktförändring</p>
                            <p className="mt-1 font-semibold">
                              {(checkIns[0].weight_kg - healthAssessment.starting_weight).toFixed(1)} kg
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Kvar till mål</p>
                            <p className="mt-1">
                              {(healthAssessment.target_weight - checkIns[0].weight_kg).toFixed(1)} kg
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Framsteg mot mål</p>
                            <p className="mt-1">
                              {Math.round((Math.abs(checkIns[0].weight_kg - healthAssessment.starting_weight) / 
                                Math.abs(healthAssessment.target_weight - healthAssessment.starting_weight)) * 100)}%
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Kroppsmått Framsteg</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {measurements.length > 0 && (
                      <div className="grid gap-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-sm font-medium">Mått</div>
                          <div className="text-sm font-medium text-center">Nuvarande</div>
                          <div className="text-sm font-medium text-center">Förändring</div>
                        </div>
                        {[
                          { key: 'neck_cm', label: 'Nacke' },
                          { key: 'chest_cm', label: 'Bröst' },
                          { key: 'waist_cm', label: 'Midja' },
                          { key: 'hips_cm', label: 'Höfter' },
                          { key: 'thigh_cm', label: 'Lår' },
                          { key: 'arm_cm', label: 'Armar' }
                        ].map(({ key, label }) => {
                          const currentValue = measurements[0]?.[key];
                          const firstValue = measurements[measurements.length - 1]?.[key];
                          const change = currentValue && firstValue ? (currentValue - firstValue).toFixed(1) : null;
                          const isPositiveChange = change && parseFloat(change) > 0;
                          const isNegativeChange = change && parseFloat(change) < 0;

                          return (
                            <div key={key} className="grid grid-cols-3 gap-4 py-2 border-t">
                              <div className="text-sm text-muted-foreground">{label}</div>
                              <div className="text-sm text-center">
                                {currentValue ? `${currentValue} cm` : 'N/A'}
                              </div>
                              <div className={`text-sm text-center ${
                                isPositiveChange ? 'text-green-600' : 
                                isNegativeChange ? 'text-red-600' : ''
                              }`}>
                                {change ? `${change > 0 ? '+' : ''}${change} cm` : 'N/A'}
                              </div>
                            </div>
                          );
                        })}
                        <div className="text-xs text-muted-foreground mt-4">
                          * Förändring sedan första mätningen ({
                            measurements[measurements.length - 1]?.weekly_checkins?.created_at ? 
                            format(new Date(measurements[measurements.length - 1].weekly_checkins.created_at), 'PPP') : 
                            'N/A'
                          })
                        </div>
                      </div>
                    )}
                    {!measurements.length && (
                      <p className="text-center text-muted-foreground">
                        Inga mätningar tillgängliga ännu
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Grundinformation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
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
                      <p className="mt-1">{getGymEquipmentText(healthAssessment.gym_equipment_access)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Activity Level</p>
                      <p className="mt-1">{getActivityLevelText(healthAssessment.current_activity_level)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sleep Patterns</p>
                      <p className="mt-1">{healthAssessment.sleep_patterns}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Stress Levels</p>
                      <p className="mt-1">{getStressLevelText(healthAssessment.stress_levels)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-6 text-center text-muted-foreground">
                  No health assessment data available.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="checkIns" className="space-y-6">
            {isLoading ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center text-muted-foreground">
                    <p>Laddar mätningar...</p>
                  </div>
                </CardContent>
              </Card>
            ) : checkIns.length > 0 ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Progress Översikt</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={checkIns}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="created_at" 
                            tickFormatter={(date) => format(new Date(date), 'MMM d')}
                          />
                          <YAxis 
                            yAxisId="weight"
                            orientation="left"
                            label={{ value: 'Vikt (kg)', angle: -90, position: 'insideLeft' }}
                          />
                          <YAxis 
                            yAxisId="measurements"
                            orientation="right"
                            label={{ value: 'Mått (cm)', angle: 90, position: 'insideRight' }}
                          />
                          <Tooltip
                            labelFormatter={(date) => format(new Date(date), 'PPP')}
                            formatter={(value, name) => {
                              if (name === 'Vikt') return [`${value} kg`, name];
                              return [`${value} cm`, name];
                            }}
                          />
                          <Legend />
                          <Line
                            yAxisId="weight"
                            type="monotone"
                            dataKey="weight_kg"
                            name="Vikt"
                            stroke="#2D6A4F"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 8 }}
                          />
                          {measurementCards.slice(1).map((card) => (
                            <Line
                              key={card.key}
                              yAxisId="measurements"
                              type="monotone"
                              dataKey={`measurements.${card.key}`}
                              name={card.title}
                              stroke={card.color}
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 8 }}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Check-in Historik</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Datum</TableHead>
                            <TableHead>Vikt (kg)</TableHead>
                            <TableHead>Nacke (cm)</TableHead>
                            <TableHead>Bröst (cm)</TableHead>
                            <TableHead>Midja (cm)</TableHead>
                            <TableHead>Höfter (cm)</TableHead>
                            <TableHead>Lår (cm)</TableHead>
                            <TableHead>Arm (cm)</TableHead>
                            <TableHead>Bilder</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {checkIns.map((checkIn) => (
                            <TableRow key={checkIn.id}>
                              <TableCell>
                                {format(new Date(checkIn.created_at), 'PPP')}
                              </TableCell>
                              <TableCell>{checkIn.weight_kg}</TableCell>
                              <TableCell>{checkIn.measurements?.neck_cm || 'N/A'}</TableCell>
                              <TableCell>{checkIn.measurements?.chest_cm || 'N/A'}</TableCell>
                              <TableCell>{checkIn.measurements?.waist_cm || 'N/A'}</TableCell>
                              <TableCell>{checkIn.measurements?.hips_cm || 'N/A'}</TableCell>
                              <TableCell>{checkIn.measurements?.thigh_cm || 'N/A'}</TableCell>
                              <TableCell>{checkIn.measurements?.arm_cm || 'N/A'}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  {checkIn.measurements?.front_photo_url && (
                                    <a 
                                      href={checkIn.measurements.front_photo_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-primary hover:text-primary/80"
                                    >
                                      <Image className="h-4 w-4" />
                                    </a>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Statistik</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {checkIns.length > 1 && (
                        <>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Viktförändring (Total)</p>
                            <p className="text-2xl font-bold">
                              {(checkIns[0].weight_kg - checkIns[checkIns.length - 1].weight_kg).toFixed(1)} kg
                            </p>
                          </div>
                          {measurementCards.slice(1).map((card) => {
                            const firstMeasurement = checkIns[checkIns.length - 1].measurements?.[card.key];
                            const latestMeasurement = checkIns[0].measurements?.[card.key];
                            if (!firstMeasurement || !latestMeasurement) return null;
                            
                            const change = latestMeasurement - firstMeasurement;
                            return (
                              <div key={card.key} className="space-y-2">
                                <p className="text-sm text-muted-foreground">{card.title} (Förändring)</p>
                                <p className="text-2xl font-bold">
                                  {change.toFixed(1)} cm
                                </p>
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center text-muted-foreground">
                    <p>Inga check-ins registrerade än.</p>
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

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Client Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Client Status</h3>
                  <p className="text-sm text-muted-foreground">
                    Change the client's status or remove them from your client list.
                  </p>
                  <div className="flex gap-4">
                    {clientProfile?.status === 'active' ? (
                      <Button
                        variant="secondary"
                        onClick={handleUnsubscribe}
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Make Inactive
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={handleActivate}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Make Active
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      onClick={handleReturnToNewArrivals}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Return to New Arrivals
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (id) {
                          deleteClient(id);
                        }
                      }}
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Delete Client
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Account Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Help your client manage their account.
                  </p>
                  <Button
                    variant="outline"
                    onClick={handlePasswordReset}
                    disabled={isResettingPassword}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    {isResettingPassword ? 'Sending Reset Link...' : 'Reset Password'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientProfile;
