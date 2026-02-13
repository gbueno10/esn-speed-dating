"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SpeedDatingProfile } from "@/lib/types/database";

export function useProfile() {
  const [profile, setProfile] = useState<SpeedDatingProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("speed_dating_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setProfile(data);
      setLoading(false);
    }


    fetchProfile();
  }, []);

  return { profile, loading };
}
