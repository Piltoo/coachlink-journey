
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { addHours } from "date-fns";

export const BookSessionDialog = ({ coachId }: { coachId: string }) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleBooking = async () => {
    if (!selectedDate) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const startTime = selectedDate;
    const endTime = addHours(startTime, 1);

    // Use type assertion for workout_sessions table
    const { error } = await supabase
      .from('workout_sessions' as any)
      .insert([{
        client_id: user.id,
        coach_id: coachId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'pending'
      }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to book session",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Session booked successfully!",
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Book Session</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book a Training Session</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
        </div>
        <DialogFooter>
          <Button 
            onClick={handleBooking} 
            disabled={!selectedDate}
          >
            Book Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
