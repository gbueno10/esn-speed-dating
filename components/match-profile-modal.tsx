"use client";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Instagram, Heart } from "lucide-react";
import { COUNTRIES } from "@/components/nationality-picker";
import type { SpeedDatingProfile } from "@/lib/types/database";

interface MatchProfileModalProps {
  profile: SpeedDatingProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isMutualMatch?: boolean;
}

export function MatchProfileModal({
  profile,
  open,
  onOpenChange,
  isMutualMatch = false,
}: MatchProfileModalProps) {
  if (!profile) return null;

  const initials = (profile.name ?? "Anonymous")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const country = profile.nationality
    ? COUNTRIES.find((c) => c.code === profile.nationality)
    : null;

  const handleOpenInstagram = () => {
    const username = profile.instagram_handle.replace(/^@/, "");
    window.open(`https://instagram.com/${username}`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={true}
        className="bg-card border-primary/30 rounded-2xl w-[85vw] max-w-[400px] sm:max-w-[400px] mx-auto shadow-[0_0_30px_rgba(255,0,127,0.2)] p-0 gap-0 overflow-hidden"
      >
        {/* Photo with Name Overlay */}
        <div className="relative w-full aspect-square overflow-hidden">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/40 to-accent/40">
              <span className="text-7xl font-black text-white/30 select-none">
                {initials}
              </span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

          {/* Name and Country Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h2 className="text-xl font-black tracking-tight text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {profile.name}
            </h2>
            {country && (
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-sm drop-shadow-lg">{country.flag}</span>
                <span className="text-[10px] font-semibold text-white/80 tracking-wide">
                  {country.name}
                </span>
              </div>
            )}

            {isMutualMatch && (
              <div className="flex items-center gap-1 mt-2 px-2.5 py-1.5 bg-secondary/90 backdrop-blur-md rounded-full w-fit">
                <Heart className="h-3 w-3 text-white fill-current animate-pulse" />
                <span className="text-[9px] font-black text-white uppercase tracking-wider">
                  You liked each other!
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Buttons and Info */}
        <div className="px-3 py-3 space-y-2">
          {profile.instagram_handle && isMutualMatch && (
            <Button
              onClick={handleOpenInstagram}
              className="w-full bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:shadow-[0_0_20px_rgba(221,42,123,0.4)] text-white font-bold tracking-wide text-[11px] h-9 rounded-full transition-all"
            >
              <Instagram className="w-3.5 h-3.5 mr-1.5" />
              Open Instagram
            </Button>
          )}

          <div className="grid grid-cols-2 gap-2">
            {profile.gender && (
              <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                  Gender
                </div>
                <div className="text-[11px] font-semibold text-white capitalize">
                  {profile.gender === "prefer-not-to-say" ? "N/A" : profile.gender}
                </div>
              </div>
            )}
            {profile.interested_in && (
              <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                  Looking For
                </div>
                <div className="text-[11px] font-semibold text-white capitalize">
                  {profile.interested_in}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
