
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type DashboardHeaderProps = {
  firstName: string;
};

export function DashboardHeader({ firstName }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold text-[#1B4332]">
        Välkommen {firstName ? firstName : ''}
      </h1>
      <div className="text-sm text-gray-600">
        {new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </div>
    </div>
  );
}
