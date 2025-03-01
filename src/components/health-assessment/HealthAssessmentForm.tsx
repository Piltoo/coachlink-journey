import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

type FormData = {
  starting_weight: number | null;
  target_weight: number | null;
  height_cm: number | null;
  gender: 'male' | 'female' | null;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null;
  dietary_preference: 'none' | 'vegetarian' | 'vegan' | 'pescatarian' | null;
  allergies: string;
  medical_conditions: string;
};

export function HealthAssessmentForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    starting_weight: null,
    target_weight: null,
    height_cm: null,
    gender: null,
    activity_level: null,
    dietary_preference: null,
    allergies: '',
    medical_conditions: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Populate form with existing data if available
    const fetchExistingData = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('client_health_assessments')
        .select('*')
        .eq('client_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching existing assessment:', error);
        return;
      }

      if (data) {
        setFormData({
          starting_weight: data.starting_weight || null,
          target_weight: data.target_weight || null,
          height_cm: data.height_cm || null,
          gender: data.gender || null,
          activity_level: data.activity_level || null,
          dietary_preference: data.dietary_preference || null,
          allergies: data.allergies || '',
          medical_conditions: data.medical_conditions || '',
        });
      }
    };

    fetchExistingData();
  }, [user?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value } as any);
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Convert string values to numbers where needed
      const numericData = {
        ...formData,
        starting_weight: formData.starting_weight ? Number(formData.starting_weight) : null,
        target_weight: formData.target_weight ? Number(formData.target_weight) : null,
        height_cm: formData.height_cm ? Number(formData.height_cm) : null
      };
      
      const { error } = await supabase
        .from('client_health_assessments')
        .insert([
          {
            client_id: user?.id,
            ...numericData
          }
        ]);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Assessment submitted successfully",
      });
      
      // Update the user's profile to mark assessment as completed
      await supabase
        .from('profiles')
        .update({ has_completed_assessment: true })
        .eq('id', user?.id);
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting health assessment:', error);
      toast({
        title: "Error",
        description: "Failed to submit assessment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Health Assessment Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="starting_weight">Starting Weight (kg)</Label>
                <Input
                  id="starting_weight"
                  type="number"
                  name="starting_weight"
                  value={formData.starting_weight || ''}
                  onChange={handleChange}
                  placeholder="Enter starting weight"
                  required
                />
              </div>
              <div>
                <Label htmlFor="target_weight">Target Weight (kg)</Label>
                <Input
                  id="target_weight"
                  type="number"
                  name="target_weight"
                  value={formData.target_weight || ''}
                  onChange={handleChange}
                  placeholder="Enter target weight"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="height_cm">Height (cm)</Label>
              <Input
                id="height_cm"
                type="number"
                name="height_cm"
                value={formData.height_cm || ''}
                onChange={handleChange}
                placeholder="Enter height in cm"
                required
              />
            </div>

            <div>
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                name="gender"
                value={formData.gender || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <Label htmlFor="activity_level">Activity Level</Label>
              <select
                id="activity_level"
                name="activity_level"
                value={formData.activity_level || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                required
              >
                <option value="">Select Activity Level</option>
                <option value="sedentary">Sedentary (little to no exercise)</option>
                <option value="light">Lightly Active (light exercise/sports 1-3 days/week)</option>
                <option value="moderate">Moderately Active (moderate exercise/sports 3-5 days/week)</option>
                <option value="active">Active (hard exercise/sports 6-7 days a week)</option>
                <option value="very_active">Very Active (very hard exercise/sports & physical job)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="dietary_preference">Dietary Preference</Label>
              <select
                id="dietary_preference"
                name="dietary_preference"
                value={formData.dietary_preference || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                required
              >
                <option value="">Select Dietary Preference</option>
                <option value="none">None</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="pescatarian">Pescatarian</option>
              </select>
            </div>

            <div>
              <Label htmlFor="allergies">Allergies</Label>
              <Input
                id="allergies"
                type="text"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="Enter any allergies"
              />
            </div>

            <div>
              <Label htmlFor="medical_conditions">Medical Conditions</Label>
              <Input
                id="medical_conditions"
                type="text"
                name="medical_conditions"
                value={formData.medical_conditions}
                onChange={handleChange}
                placeholder="Enter any medical conditions"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
