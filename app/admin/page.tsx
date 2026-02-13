"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AdminToggle } from "@/components/admin-toggle";
import { LoadingScreen } from "@/components/ui/loading-screen";
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
    return <LoadingScreen message="Admin Panel" />;
  }

  return (
    <div className="min-h-svh bg-background p-4">
      <header className="px-4 py-6 text-center">
        <h1 className="text-3xl font-black text-white glitch-hover" data-text="SYSTEM CONTROL">SYSTEM CONTROL</h1>
        <p className="text-secondary font-bold tracking-widest text-xs uppercase mt-1">Administrator Access</p>
      </header>
      <div className="max-w-md mx-auto py-6 space-y-6">
        <Card className="event-card border-none bg-card/50">
          <div className="p-6 pb-2">
             <div className="flex items-center gap-3 mb-2">
                <div className="h-3 w-3 bg-primary rounded-full animate-pulse" />
                <CardTitle className="text-xl font-bold text-white tracking-wide">EVENT CONFIGURATION</CardTitle>
             </div>
             <div className="h-px w-full bg-gradient-to-r from-primary to-transparent" />
          </div>
          <CardContent className="space-y-6 pt-4">
            <AdminToggle
              label="VOTING PHASE"
              description="Enable 'Like' functionality for all connected nodes."
              checked={settings.is_voting_open}
              onCheckedChange={(v) => updateSetting("is_voting_open", v)}
              disabled={updating}
            />
            <div className="h-px w-full bg-white/5" />
            <AdminToggle
              label="REVEAL MATCHES"
              description="Broadcast mutual connections and contact data."
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
