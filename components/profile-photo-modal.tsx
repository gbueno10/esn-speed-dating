"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { uploadAvatar } from "@/lib/upload-avatar";
import { toast } from "sonner";
import type { SpeedDatingProfile } from "@/lib/types/database";

interface ProfilePhotoModalProps {
  profile: SpeedDatingProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdate: (updatedProfile: SpeedDatingProfile) => void;
}

export function ProfilePhotoModal({
  profile,
  open,
  onOpenChange,
  onProfileUpdate,
}: ProfilePhotoModalProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = (profile.name ?? "Anonymous")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setPreviewUrl(URL.createObjectURL(file));

    try {
      setUploading(true);
      const updatedProfile = await uploadAvatar(file, profile);
      toast.success("Photo uploaded!");
      onProfileUpdate(updatedProfile);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Upload failed: " + (error.message || "Try again"));
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = () => {
    sessionStorage.setItem("skipped-photo-modal", "true");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-card border-primary/30 rounded-3xl max-w-sm mx-auto shadow-[0_0_40px_rgba(255,0,127,0.2)]"
      >
        <DialogHeader className="items-center">
          <div className="text-4xl mb-2 animate-bounce">📸</div>
          <DialogTitle className="text-2xl font-black text-white text-center">
            Add your photo!
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-center text-sm">
            Let others recognize you at the event
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          <div
            className="relative cursor-pointer group"
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl animate-pulse" />

            <Avatar className="h-36 w-36 border-4 border-white/50 relative z-10 shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:border-primary/50">
              <AvatarImage
                src={previewUrl ?? undefined}
                className="object-cover"
              />
              <AvatarFallback className="text-5xl bg-gradient-to-br from-primary to-accent text-white font-black">
                {initials}
              </AvatarFallback>

              {uploading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 rounded-full backdrop-blur-sm">
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                </div>
              )}
            </Avatar>

            {!uploading && (
              <div className="absolute -bottom-1 -right-1 z-30 transition-transform duration-300 group-hover:scale-110">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary animate-ping rounded-full opacity-40" />
                  <div className="absolute -inset-2 bg-primary/50 blur-xl animate-pulse rounded-full" />
                  <div className="relative bg-primary text-white p-3 rounded-full border-2 border-white shadow-[0_0_20px_rgba(255,0,127,1)] flex items-center justify-center">
                    <Camera className="w-5 h-5" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />

          <p className="text-xs text-muted-foreground text-center font-medium">
            Tap the photo to choose an image
          </p>

          <button
            type="button"
            onClick={handleSkip}
            className="text-xs text-white/40 hover:text-white/70 transition-colors font-medium tracking-wide"
          >
            Skip for now
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
