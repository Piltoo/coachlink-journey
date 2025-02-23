
import { Card } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Settings2, Building2, CreditCard, User } from "lucide-react";
import { AccountSettings } from "./settings/AccountSettings";
import { BrandingSettings } from "./settings/BrandingSettings";
import { SubscriptionSettings } from "./settings/SubscriptionSettings";
import { useCoachCheck } from "@/hooks/useCoachCheck";

export default function Settings() {
  const { isCoach, isLoading } = useCoachCheck();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50 flex items-center justify-center">
        <Card className="p-6 bg-white/40 backdrop-blur-lg">
          <p className="text-muted-foreground">Loading...</p>
        </Card>
      </div>
    );
  }

  if (!isCoach) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50 flex items-center justify-center">
        <Card className="p-6 bg-white/40 backdrop-blur-lg border border-green-100">
          <h2 className="text-xl font-semibold text-primary mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">Only coaches can access the settings page.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Settings2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">Settings</h1>
          </div>

          <Card className="p-6 bg-white/40 backdrop-blur-lg border border-green-100">
            <Tabs defaultValue="account">
              <TabsList className="mb-4">
                <TabsTrigger value="account" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Account
                </TabsTrigger>
                <TabsTrigger value="branding" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Branding
                </TabsTrigger>
                <TabsTrigger value="subscriptions" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Subscription Plans
                </TabsTrigger>
              </TabsList>

              <TabsContent value="account">
                <AccountSettings />
              </TabsContent>

              <TabsContent value="branding">
                <BrandingSettings />
              </TabsContent>

              <TabsContent value="subscriptions">
                <SubscriptionSettings />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
