"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SpeedDatingProfile } from "@/lib/types/database";

export type ConnectionItem = {
  id: string;
  user: SpeedDatingProfile;
  iLikedThem: boolean;
  theyLikedMe: boolean;
  isMutualMatch: boolean;
};

export function useConnections(profileId: string | undefined) {
  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = useCallback(async () => {
    if (!profileId) return;

    const supabase = createClient();

    // Get all my connections (I'm the scanner, they're the scanned)
    const { data: myConnections } = await supabase
      .from("speed_dating_connections")
      .select("id, scanned_id, scanned:speed_dating_profiles!speed_dating_connections_scanned_id_fkey(*)")
      .eq("scanner_id", profileId);

    // Get my outgoing likes
    const { data: myLikes } = await supabase
      .from("speed_dating_likes")
      .select("liked_id")
      .eq("liker_id", profileId);

    // Get incoming likes (only works when matches are revealed due to RLS)
    const { data: incomingLikes } = await supabase
      .from("speed_dating_likes")
      .select("liker_id")
      .eq("liked_id", profileId);

    const myLikedIds = new Set(myLikes?.map((l) => l.liked_id) ?? []);
    const theyLikedMeIds = new Set(
      incomingLikes?.map((l) => l.liker_id) ?? []
    );

    const items: ConnectionItem[] =
      (myConnections ?? []).map((c) => {
        const user = c.scanned as unknown as SpeedDatingProfile;
        const iLikedThem = myLikedIds.has(user.id);
        const theyLikedMe = theyLikedMeIds.has(user.id);
        return {
          id: c.id,
          user,
          iLikedThem,
          theyLikedMe,
          isMutualMatch: iLikedThem && theyLikedMe,
        };
      });

    setConnections(items);
    setLoading(false);
  }, [profileId]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  return { connections, loading, refetch: fetchConnections };
}
