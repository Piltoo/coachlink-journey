
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/ui/glass-card";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { SignInForm } from "@/components/auth/SignInForm";
import { PasswordResetForm } from "@/components/auth/PasswordResetForm";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const navigate = useNavigate();

  const handleSignUpSuccess = () => {
    setShowConfirmation(true);
    setTimeout(() => {
      navigate("/");
    }, 5000);
  };

  const handleSignInSuccess = (profileData: any) => {
    navigate("/dashboard");
  };

  if (showPasswordReset) {
    return <PasswordResetForm onSuccess={() => navigate("/health-assessment")} />;
  }

  if (showConfirmation) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100/30 to-green-50 flex items-center justify-center px-4">
      <GlassCard className="w-full max-w-md p-8 bg-white/40 backdrop-blur-lg">
        <h2 className="text-2xl font-bold text-primary text-center mb-6">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h2>
        {isSignUp ? (
          <SignUpForm
            onSuccess={handleSignUpSuccess}
            onToggleMode={() => setIsSignUp(false)}
          />
        ) : (
          <SignInForm
            onPasswordReset={() => setShowPasswordReset(true)}
            onToggleMode={() => setIsSignUp(true)}
            onSignInSuccess={handleSignInSuccess}
          />
        )}
      </GlassCard>
    </div>
  );
};

export default Auth;
