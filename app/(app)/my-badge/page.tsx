"use client";

import { useEffect, useState } from "react";
import { ProfileBadge } from "@/components/profile-badge";
import { ProfilePhotoModal } from "@/components/profile-photo-modal";
import { EditProfileDrawer } from "@/components/edit-profile-drawer";
import { LoadingScreen } from "@/components/ui/loading-screen";
import type { SpeedDatingProfile } from "@/lib/types/database";

export default function MyBadgePage() {
  const [profile, setProfile] = useState<SpeedDatingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showEditDrawer, setShowEditDrawer] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();

        if (res.ok) {
          setProfile(data.profile);

          if (
            !data.profile.avatar_url &&
            !sessionStorage.getItem("skipped-photo-modal")
          ) {
            setShowPhotoModal(true);
          }
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
    return <LoadingScreen message="Loading Badge" />;
  }

  if (!profile) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Profile not found.
      </div>
    );
  }

  return (
    <>
      <ProfileBadge
        profile={profile}
        editable={true}
        onProfileUpdate={(updatedProfile) => setProfile(updatedProfile)}
        onEditClick={() => setShowEditDrawer(true)}
      />

      <ProfilePhotoModal
        profile={profile}
        open={showPhotoModal}
        onOpenChange={setShowPhotoModal}
        onProfileUpdate={(updatedProfile) => setProfile(updatedProfile)}
      />

      <EditProfileDrawer
        profile={profile}
        open={showEditDrawer}
        onOpenChange={setShowEditDrawer}
        onProfileUpdate={(updatedProfile) => setProfile(updatedProfile)}
      />
    </>
  );
}
