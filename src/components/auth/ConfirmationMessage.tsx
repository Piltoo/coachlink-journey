
import { GlassCard } from "@/components/ui/glass-card";

export function ConfirmationMessage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100/30 to-green-50 flex items-center justify-center px-4">
      <GlassCard className="w-full max-w-md p-8 bg-white/40 backdrop-blur-lg text-center">
        <h2 className="text-2xl font-bold text-primary mb-4">Thank you for your request!</h2>
        <p className="text-gray-600">
          We will send you an email with the confirmation when a coach accepts your request.
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Redirecting to home page in a few seconds...
        </p>
      </GlassCard>
    </div>
  );
}
