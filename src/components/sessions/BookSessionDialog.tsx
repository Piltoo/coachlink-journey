
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
import { addHours, format, isSameDay, setHours, setMinutes, startOfDay } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TimeSlot = {
  start: Date;
  end: Date;
};

export const BookSessionDialog = ({ coachId }: { coachId: string }) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedSlot, setSelectedSlot] = useState<string>();
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Generate time slots for the selected date
  const generateTimeSlots = async (date: Date) => {
    const slots: TimeSlot[] = [];
    const startHour = 8; // Start at 8 AM
    const endHour = 18; // End at 6 PM
    
    // Generate all possible slots
    for (let hour = startHour; hour < endHour; hour++) {
      const slotStart = setHours(setMinutes(startOfDay(date), 0), hour);
      const slotEnd = addHours(slotStart, 1);
      slots.push({ start: slotStart, end: slotEnd });
    }

    // Fetch existing sessions for the coach on this date
    const dayStart = startOfDay(date);
    const dayEnd = addHours(dayStart, 24);
    
    const { data: existingSessions, error } = await supabase
      .from('workout_sessions')
      .select('start_time, end_time')
      .eq('coach_id', coachId)
      .gte('start_time', dayStart.toISOString())
      .lt('start_time', dayEnd.toISOString())
      .not('status', 'eq', 'cancelled');

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load coach's schedule",
        variant: "destructive",
      });
      return [];
    }

    // Filter out slots that overlap with existing sessions
    const availableSlots = slots.filter(slot => {
      return !existingSessions?.some(session => {
        const sessionStart = new Date(session.start_time);
        const sessionEnd = new Date(session.end_time);
        return (
          (slot.start >= sessionStart && slot.start < sessionEnd) ||
          (slot.end > sessionStart && slot.end <= sessionEnd)
        );
      });
    });

    return availableSlots;
  };

  const handleDateSelect = async (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(undefined);
    if (date) {
      const slots = await generateTimeSlots(date);
      setAvailableSlots(slots);
    }
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const selectedTime = availableSlots.find(slot => 
      format(slot.start, 'HH:mm') === selectedSlot
    );

    if (!selectedTime) return;

    const { error } = await supabase
      .from('workout_sessions')
      .insert([{
        client_id: user.id,
        coach_id: coachId,
        start_time: selectedTime.start.toISOString(),
        end_time: selectedTime.end.toISOString(),
        status: 'pending'
      }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to request session",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Session request sent successfully!",
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Request Session</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request a Training Session</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border"
            disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
          />
          
          {selectedDate && availableSlots.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Available Time Slots</label>
              <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map((slot) => (
                    <SelectItem 
                      key={format(slot.start, 'HH:mm')} 
                      value={format(slot.start, 'HH:mm')}
                    >
                      {format(slot.start, 'HH:mm')} - {format(slot.end, 'HH:mm')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedDate && availableSlots.length === 0 && (
            <div className="text-center text-sm text-muted-foreground">
              No available slots for this date
            </div>
          )}
        </div>
        <DialogFooter>
          <Button 
            onClick={handleBooking} 
            disabled={!selectedDate || !selectedSlot}
          >
            Request Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
