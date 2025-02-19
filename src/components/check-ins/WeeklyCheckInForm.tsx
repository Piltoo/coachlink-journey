import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { UploadCloud } from "lucide-react";
import { format, isAfter, parseISO, addDays } from "date-fns";

type Measurement = {
  neck_cm: string;
  waist_cm: string;
  hips_cm: string;
  thigh_cm: string;
  arm_cm: string;
};

export const WeeklyCheckInForm = () => {
  const { toast } = useToast();
  const [weight, setWeight] = useState("");
  const [measurements, setMeasurements] = useState<Measurement>({
    neck_cm: "",
    waist_cm: "",
    hips_cm: "",
    thigh_cm: "",
    arm_cm: "",
  });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questions, setQuestions] = useState<Array<{ id: string; question: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const [canSubmit, setCanSubmit] = useState(true);
  const [photos, setPhotos] = useState({
    front: null as File | null,
    side: null as File | null,
    back: null as File | null
  });
  const [previousMeasurements, setPreviousMeasurements] = useState<any[]>([]);

  useEffect(() => {
    const fetchLastCheckIn = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch last check-in
      const { data: lastCheckInData } = await supabase
        .from('weekly_checkins')
        .select('created_at')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (lastCheckInData) {
        setLastCheckIn(lastCheckInData.created_at);
        const nextAllowedDate = addDays(parseISO(lastCheckInData.created_at), 7);
        setCanSubmit(isAfter(new Date(), nextAllowedDate));
      }

      // Fetch previous measurements
      const { data: measurementsHistory } = await supabase
        .from('measurements')
        .select(`
          *,
          weekly_checkins (
            created_at,
            weight_kg
          )
        `)
        .eq('weekly_checkins.client_id', user.id)
        .order('created_at', { ascending: false });

      if (measurementsHistory) {
        setPreviousMeasurements(measurementsHistory);
      }
    };

    fetchLastCheckIn();
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from('weekly_checkin_questions')
      .select('id, question');
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load questions. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setQuestions(data);
      const initialAnswers: Record<string, string> = {};
      data.forEach(q => initialAnswers[q.id] = "");
      setAnswers(initialAnswers);
    }
  };

  const handlePhotoChange = (type: 'front' | 'side' | 'back', file: File | null) => {
    setPhotos(prev => ({ ...prev, [type]: file }));
  };

  const uploadPhoto = async (file: File, type: string) => {
    if (!file) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('progress-photos')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Error uploading ${type} photo`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('progress-photos')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleMeasurementChange = (key: keyof Measurement, value: string) => {
    setMeasurements(prev => ({ ...prev, [key]: value }));
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      toast({
        title: "Cannot Submit",
        description: "You must wait 7 days between check-ins.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Upload photos
      const [frontUrl, sideUrl, backUrl] = await Promise.all([
        photos.front ? uploadPhoto(photos.front, 'front') : Promise.resolve(null),
        photos.side ? uploadPhoto(photos.side, 'side') : Promise.resolve(null),
        photos.back ? uploadPhoto(photos.back, 'back') : Promise.resolve(null),
      ]);

      // Create weekly check-in
      const { data: checkinData, error: checkinError } = await supabase
        .from('weekly_checkins')
        .insert({
          weight_kg: parseFloat(weight),
          status: 'completed',
          client_id: user.id
        })
        .select()
        .single();

      if (checkinError) throw checkinError;

      // Add measurements with photo URLs
      const { error: measurementError } = await supabase
        .from('measurements')
        .insert({
          checkin_id: checkinData.id,
          neck_cm: parseFloat(measurements.neck_cm),
          waist_cm: parseFloat(measurements.waist_cm),
          hips_cm: parseFloat(measurements.hips_cm),
          thigh_cm: parseFloat(measurements.thigh_cm),
          arm_cm: parseFloat(measurements.arm_cm),
          front_photo_url: frontUrl,
          side_photo_url: sideUrl,
          back_photo_url: backUrl,
        });

      if (measurementError) throw measurementError;

      // Add answers
      const answersToInsert = Object.entries(answers).map(([questionId, answer]) => ({
        checkin_id: checkinData.id,
        question_id: questionId,
        answer
      }));

      const { error: answersError } = await supabase
        .from('checkin_answers')
        .insert(answersToInsert);

      if (answersError) throw answersError;

      toast({
        title: "Success!",
        description: "Your weekly check-in has been submitted.",
      });

      // Reset form
      setWeight("");
      setMeasurements({
        neck_cm: "",
        waist_cm: "",
        hips_cm: "",
        thigh_cm: "",
        arm_cm: "",
      });
      setPhotos({ front: null, side: null, back: null });
      const resetAnswers: Record<string, string> = {};
      questions.forEach(q => resetAnswers[q.id] = "");
      setAnswers(resetAnswers);
      setLastCheckIn(new Date().toISOString());
      setCanSubmit(false);

      // Refresh measurements history
      const { data: newMeasurements } = await supabase
        .from('measurements')
        .select(`
          *,
          weekly_checkins (
            created_at,
            weight_kg
          )
        `)
        .eq('weekly_checkins.client_id', user.id)
        .order('created_at', { ascending: false });

      if (newMeasurements) {
        setPreviousMeasurements(newMeasurements);
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit check-in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100 p-6">
        <h2 className="text-xl font-semibold text-primary mb-4">Weekly Check-in</h2>
        
        {!canSubmit && lastCheckIn && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">
              Your next check-in will be available on {format(addDays(parseISO(lastCheckIn), 7), 'MMMM d, yyyy')}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weight" className="text-sm font-medium text-gray-700">
                Weight (kg)
              </Label>
              <Input 
                id="weight"
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Enter weight in kg"
                required
              />
            </div>
            <div>
              <Label htmlFor="neck_cm" className="text-sm font-medium text-gray-700">
                Neck (cm)
              </Label>
              <Input
                id="neck_cm"
                type="number"
                step="0.1"
                value={measurements.neck_cm}
                onChange={(e) => handleMeasurementChange('neck_cm', e.target.value)}
                placeholder="Enter neck measurement"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(measurements)
              .filter(([key]) => key !== 'neck_cm')
              .map(([key, value]) => (
                <div key={key}>
                  <Label htmlFor={key} className="text-sm font-medium text-gray-700">
                    {key.replace('_cm', '').split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')} (cm)
                  </Label>
                  <Input
                    id={key}
                    type="number"
                    step="0.1"
                    value={value}
                    onChange={(e) => handleMeasurementChange(key as keyof Measurement, e.target.value)}
                    placeholder={`Enter ${key.replace('_cm', '')} measurement`}
                    required
                  />
                </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['front', 'side', 'back'] as const).map((view) => (
              <div key={view}>
                <Label htmlFor={`${view}-photo`} className="text-sm font-medium text-gray-700">
                  {view.charAt(0).toUpperCase() + view.slice(1)} View Photo
                </Label>
                <div className="mt-1 flex items-center">
                  <label className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                    <UploadCloud className="w-5 h-5 mr-2" />
                    {photos[view] ? photos[view].name : 'Upload Photo'}
                    <input
                      type="file"
                      id={`${view}-photo`}
                      className="sr-only"
                      accept="image/*"
                      onChange={(e) => handlePhotoChange(view, e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {questions.map((q) => (
              <div key={q.id}>
                <Label htmlFor={q.id} className="text-sm font-medium text-gray-700">
                  {q.question}
                </Label>
                <Input
                  id={q.id}
                  value={answers[q.id]}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  placeholder="Your answer"
                  required
                />
              </div>
            ))}
          </div>

          <Button type="submit" disabled={isLoading || !canSubmit}>
            {isLoading ? "Submitting..." : "Submit Check-in"}
          </Button>
        </form>
      </GlassCard>

      {previousMeasurements.length > 0 && (
        <GlassCard className="bg-white/40 backdrop-blur-lg border border-green-100 p-6">
          <h3 className="text-xl font-semibold text-primary mb-4">Previous Measurements</h3>
          <div className="space-y-4">
            {previousMeasurements.map((measurement, index) => (
              <div key={measurement.id} className="border-b border-gray-200 pb-4">
                <p className="font-medium text-gray-700">
                  {format(parseISO(measurement.weekly_checkins.created_at), 'MMMM d, yyyy')}
                </p>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <p className="text-sm text-gray-600">Weight: {measurement.weekly_checkins.weight_kg} kg</p>
                  <p className="text-sm text-gray-600">Neck: {measurement.neck_cm} cm</p>
                  <p className="text-sm text-gray-600">Waist: {measurement.waist_cm} cm</p>
                  <p className="text-sm text-gray-600">Hips: {measurement.hips_cm} cm</p>
                  <p className="text-sm text-gray-600">Thigh: {measurement.thigh_cm} cm</p>
                  <p className="text-sm text-gray-600">Arm: {measurement.arm_cm} cm</p>
                </div>
                {(measurement.front_photo_url || measurement.side_photo_url || measurement.back_photo_url) && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {measurement.front_photo_url && (
                      <img 
                        src={measurement.front_photo_url} 
                        alt="Front view" 
                        className="rounded-lg w-full h-32 object-cover"
                      />
                    )}
                    {measurement.side_photo_url && (
                      <img 
                        src={measurement.side_photo_url} 
                        alt="Side view" 
                        className="rounded-lg w-full h-32 object-cover"
                      />
                    )}
                    {measurement.back_photo_url && (
                      <img 
                        src={measurement.back_photo_url} 
                        alt="Back view" 
                        className="rounded-lg w-full h-32 object-cover"
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
};
