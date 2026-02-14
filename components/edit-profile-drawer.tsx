"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { NationalityPicker } from "@/components/nationality-picker";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadAvatar } from "@/lib/upload-avatar";
import type { SpeedDatingProfile } from "@/lib/types/database";

interface EditProfileDrawerProps {
  profile: SpeedDatingProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdate: (updatedProfile: SpeedDatingProfile) => void;
}

export function EditProfileDrawer({
  profile,
  open,
  onOpenChange,
  onProfileUpdate,
}: EditProfileDrawerProps) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(profile);
  const [name, setName] = useState(profile.name);
  const [instagram, setInstagram] = useState(
    profile.instagram_handle.replace(/^@/, "")
  );
  const [nationality, setNationality] = useState<string | null>(
    profile.nationality
  );
  const [gender, setGender] = useState<string | null>(profile.gender);
  const [interestedIn, setInterestedIn] = useState<string | null>(
    profile.interested_in
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = (currentProfile.name ?? "Anonymous")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    try {
      setUploading(true);
      const updatedProfile = await uploadAvatar(e.target.files[0], currentProfile);
      setCurrentProfile(updatedProfile);
      onProfileUpdate(updatedProfile);
      toast.success("Photo updated!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Failed to upload photo: " + (error.message || "Try again"));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!instagram.trim()) {
      toast.error("Instagram is required");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          instagram_handle: instagram.trim().startsWith("@")
            ? instagram.trim()
            : `@${instagram.trim()}`,
          nationality,
          gender,
          interested_in: interestedIn,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      const data = await res.json();
      onProfileUpdate(data.profile);
      toast.success("Profile updated!");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-primary/30 rounded-3xl max-w-sm mx-auto shadow-[0_0_40px_rgba(255,0,127,0.2)] max-h-[85vh] overflow-y-auto sm:!top-auto sm:!bottom-0 sm:!translate-y-0 !top-auto !bottom-0 !translate-y-0 rounded-b-none animate-in slide-in-from-bottom duration-300">
        <DialogHeader className="items-center">
          <DialogTitle className="text-xl font-black text-white text-center">
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Profile Photo Section */}
          <div className="flex flex-col items-center py-4">
            <div
              className="relative cursor-pointer group"
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse" />

              <Avatar className="h-24 w-24 border-4 border-white/50 relative z-10 shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:border-primary/50">
                <AvatarImage
                  src={currentProfile.avatar_url ?? undefined}
                  className="object-cover"
                />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-accent text-white font-black">
                  {initials}
                </AvatarFallback>

                {uploading && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 rounded-full backdrop-blur-sm">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </Avatar>

              <div className="absolute -bottom-1 -right-1 z-30 transition-transform duration-300 group-hover:scale-110">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary animate-ping rounded-full opacity-40" />
                  <div className="absolute -inset-1 bg-primary/50 blur-md animate-pulse rounded-full" />
                  <div className="relative bg-primary text-white p-2 rounded-full border-2 border-white shadow-[0_0_15px_rgba(255,0,127,1)] flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              Tap to change photo
            </p>
          </div>

          <div className="space-y-2">
            <Label className="auth-label">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="event-input"
              placeholder="Your name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender" className="auth-label">Gender</Label>
              <select
                id="gender"
                value={gender ?? ""}
                onChange={(e) => setGender(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-input bg-muted/50 px-3 py-1 text-sm shadow-xs transition-colors text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
              >
                <option value="" className="bg-card">Select...</option>
                <option value="male" className="bg-card">Male</option>
                <option value="female" className="bg-card">Female</option>
                <option value="non-binary" className="bg-card">Non-binary</option>
                <option value="prefer-not-to-say" className="bg-card">N/A</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="interested_in" className="auth-label">Looking For</Label>
              <select
                id="interested_in"
                value={interestedIn ?? ""}
                onChange={(e) => setInterestedIn(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-input bg-muted/50 px-3 py-1 text-sm shadow-xs transition-colors text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
              >
                <option value="" className="bg-card">Select...</option>
                <option value="men" className="bg-card">Men</option>
                <option value="women" className="bg-card">Women</option>
                <option value="everyone" className="bg-card">Everyone</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="auth-label">Instagram</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">
                @
              </span>
              <Input
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="event-input pl-8"
                placeholder="username"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="auth-label">Nationality</Label>
            <NationalityPicker
              value={nationality}
              onChange={setNationality}
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-primary hover:bg-primary/90 text-white font-black tracking-widest text-sm h-12 rounded-full shadow-[0_0_20px_rgba(255,0,127,0.4)] hover:shadow-[0_0_30px_rgba(255,0,127,0.6)] hover:scale-[1.02] transition-all mt-2"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "SAVE"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
