
import { useCoachCheck } from "@/hooks/useCoachCheck";

interface AccessCheckProps {
  children?: React.ReactNode;
}

export function AccessCheck({ children }: AccessCheckProps) {
  const { isCoach, isLoading } = useCoachCheck();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <p className="text-center">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isCoach) {
    return (
      <div className="min-h-screen bg-background pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-red-100">
            <p className="text-center text-red-600">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
