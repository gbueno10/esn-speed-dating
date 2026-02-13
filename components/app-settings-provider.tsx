"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SpeedDatingSettings } from "@/lib/types/database";

type AppSettingsContextType = {
  is_voting_open: boolean;
  are_matches_revealed: boolean;
};

const AppSettingsContext = createContext<AppSettingsContextType>({
  is_voting_open: false,
  are_matches_revealed: false,
});

export function AppSettingsProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings: AppSettingsContextType;
}) {
  const [settings, setSettings] =
    useState<AppSettingsContextType>(initialSettings);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("speed_dating_settings_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "speed_dating_settings",
          filter: "id=eq.1",
        },
        (payload) => {
          setSettings({
            is_voting_open: (payload.new as SpeedDatingSettings).is_voting_open,
            are_matches_revealed: (payload.new as SpeedDatingSettings)
              .are_matches_revealed,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <AppSettingsContext.Provider value={settings}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  return useContext(AppSettingsContext);
}
