"use client";

import { useEffect, useState } from "react";
import { ProfileBadge } from "@/components/profile-badge";
import type { SpeedDatingProfile } from "@/lib/types/database";

export default function MyBadgePage() {
  const [profile, setProfile] = useState<SpeedDatingProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();

        if (res.ok) {
          setProfile(data.profile);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Profile not found.
      </div>
    );
  }

  return <ProfileBadge profile={profile} />;
}
