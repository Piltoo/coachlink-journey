
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createModal } from "./DeleteConfirmationModal";

export const useDeleteClient = (onClientUpdated: () => void) => {
  const { toast } = useToast();

  const deleteClient = async (clientId: string) => {
    const passwordInput = document.createElement('div');
    passwordInput.innerHTML = `
      <input type="password" id="password-confirmation" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="Enter your password">
    `;
    
    const result = await createModal({
      title: 'Confirm Deletion',
      content: passwordInput
    });
    
    if (!result || typeof result !== 'string') {
      return;
    }

    const passwordValue = result;

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

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: passwordValue,
      });

      if (signInError) {
        toast({
          title: "Error",
          description: "Incorrect password",
          variant: "destructive",
        });
        return;
      }

      const confirmContent = document.createElement('p');
      confirmContent.textContent = "Are you sure you want to delete this client? This action cannot be undone. All client data will be permanently deleted.";
      confirmContent.style.color = '#4B5563';
      confirmContent.style.marginBottom = '8px';
      
      const confirmed = await createModal({
        title: 'Delete Client',
        content: confirmContent
      });

      if (!confirmed) {
        return;
      }

      // Delete in correct order to maintain referential integrity
      // 1. Delete nutrition plans
      await supabase
        .from('nutrition_plans')
        .delete()
        .eq('client_id', clientId);

      // 2. Delete workout plans
      await supabase
        .from('workout_plans')
        .delete()
        .eq('client_id', clientId);

      // 3. Delete workout sessions
      await supabase
        .from('workout_sessions')
        .delete()
        .eq('client_id', clientId);

      // 4. Delete client health assessments
      await supabase
        .from('client_health_assessments')
        .delete()
        .eq('client_id', clientId);

      // 5. Delete weekly checkins and related data
      const { data: checkins } = await supabase
        .from('weekly_checkins')
        .select('id')
        .eq('client_id', clientId);

      if (checkins) {
        for (const checkin of checkins) {
          // Delete measurements
          await supabase
            .from('measurements')
            .delete()
            .eq('checkin_id', checkin.id);

          // Delete checkin answers
          await supabase
            .from('checkin_answers')
            .delete()
            .eq('checkin_id', checkin.id);
        }
      }

      // Delete the weekly checkins themselves
      await supabase
        .from('weekly_checkins')
        .delete()
        .eq('client_id', clientId);

      // 6. Delete programs
      await supabase
        .from('programs')
        .delete()
        .eq('client_id', clientId);

      // 7. Delete coach-client relationship
      await supabase
        .from('coach_clients')
        .delete()
        .eq('client_id', clientId);

      // 8. Delete subscriptions and related payments
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('client_id', clientId);

      if (subscriptions) {
        for (const subscription of subscriptions) {
          await supabase
            .from('payments')
            .delete()
            .eq('subscription_id', subscription.id);
        }

        await supabase
          .from('subscriptions')
          .delete()
          .eq('client_id', clientId);
      }

      // 9. Delete messages
      await supabase
        .from('messages')
        .delete()
        .or(`sender_id.eq.${clientId},receiver_id.eq.${clientId}`);

      // 10. Finally, delete the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', clientId);

      if (profileError) throw profileError;

      toast({
        title: "Success",
        description: "Client deleted successfully",
      });

      onClientUpdated();
    } catch (error: any) {
      console.error('Error deleting client:', error);
      toast({
        title: "Error",
        description: "Failed to delete client: " + error.message,
        variant: "destructive",
      });
    }
  };

  return { deleteClient };
};
