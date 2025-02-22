
import { GlassCard } from "@/components/ui/glass-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "@/components/auth/SignInForm";
import { RequestForm } from "@/components/auth/RequestForm";
import { useSearchParams, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const mode = searchParams.get("mode") || "sign-in";

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  if (mode === "confirmation") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100/30 to-green-50 flex items-center justify-center px-4">
        <GlassCard className="w-full max-w-md p-8 bg-white/40 backdrop-blur-lg text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">Thank you for your request!</h2>
          <p className="text-gray-600">
            We will review your application and get back to you soon via email.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100/30 to-green-50 flex items-center justify-center px-4">
      <GlassCard className="w-full max-w-md p-8 bg-white/40 backdrop-blur-lg">
        <Tabs defaultValue={mode} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sign-in">Sign In</TabsTrigger>
            <TabsTrigger value="request">Request to Join</TabsTrigger>
          </TabsList>

          <TabsContent value="sign-in" className="space-y-4">
            <h2 className="text-2xl font-bold text-primary text-center mb-6">
              Sign In
            </h2>
            <SignInForm />
          </TabsContent>

          <TabsContent value="request" className="space-y-4">
            <h2 className="text-2xl font-bold text-primary text-center mb-6">
              Request to Join
            </h2>
            <RequestForm />
          </TabsContent>
        </Tabs>
      </GlassCard>
    </div>
  );
}
