"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AdminToggle } from "@/components/admin-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import type { SpeedDatingSettings } from "@/lib/types/database";

export default function AdminPage() {
  const [settings, setSettings] = useState<SpeedDatingSettings | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function fetch() {
      const supabase = createClient();
      const { data } = await supabase
        .from("speed_dating_settings")
        .select("*")
        .eq("id", 1)
        .single();
      setSettings(data);
    }
    fetch();
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-settings")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "speed_dating_settings",
          filter: "id=eq.1",
        },
        (payload) => {
          setSettings(payload.new as SpeedDatingSettings);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function updateSetting(
    field: "is_voting_open" | "are_matches_revealed",
    value: boolean
  ) {
    setUpdating(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("speed_dating_settings")
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq("id", 1);

    if (error) {
      toast.error("Failed to update settings");
    } else {
      toast.success("Settings updated!");
    }
    setUpdating(false);
  }

  if (!settings) {
    return (
      <div className="min-h-svh flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b px-4 py-3">
        <h1 className="text-lg font-bold text-center">Admin Panel</h1>
      </header>
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Event Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AdminToggle
              label="Open Voting Phase"
              description="Enables the Like buttons for all users"
              checked={settings.is_voting_open}
              onCheckedChange={(v) => updateSetting("is_voting_open", v)}
              disabled={updating}
            />
            <AdminToggle
              label="Reveal Matches"
              description="Shows mutual matches and Instagram handles"
              checked={settings.are_matches_revealed}
              onCheckedChange={(v) => updateSetting("are_matches_revealed", v)}
              disabled={updating}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
