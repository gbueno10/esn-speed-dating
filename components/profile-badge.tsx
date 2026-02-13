"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SpeedDatingProfile } from "@/lib/types/database";

export function ProfileBadge({ profile }: { profile: SpeedDatingProfile }) {
  const initials = (profile.name ?? "Anonymous")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="w-full max-w-sm mx-auto mt-4 animate-in fade-in zoom-in-95 duration-500">
      <Card className="relative glass-panel border-2 border-primary/50 flex flex-col items-center p-8 holographic-effect overflow-hidden rounded-[2.5rem] shadow-2xl">
        {/* Decorative Corner Decor */}
        <div className="absolute top-6 left-6 w-10 h-10 border-t-2 border-l-2 border-primary/40 rounded-tl-2xl" />
        <div className="absolute bottom-6 right-6 w-10 h-10 border-b-2 border-r-2 border-secondary/40 rounded-br-2xl" />

        <div className="flex flex-col items-center w-full">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl animate-pulse" />
            <Avatar className="h-32 w-32 border-4 border-white relative z-10 shadow-xl">
              <AvatarImage src={profile.avatar_url ?? undefined} className="object-cover" />
              <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-accent text-white font-black">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <h2 className="text-3xl font-black mb-1 tracking-tighter text-white drop-shadow-lg text-center leading-tight">
            {profile.name}
          </h2>
          
          <div className="px-4 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8">
            <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">ESN Speed Dating</p>
          </div>

          <div className="relative p-4 bg-white rounded-[2rem] shadow-[0_0_30px_rgba(255,0,127,0.2)] group transition-transform duration-500 hover:scale-105">
            <QRCodeSVG
              value={profile.id}
              size={180}
              level="M"
              includeMargin={false}
              fgColor="#240046" 
              bgColor="#ffffff"
            />
          </div>
          
          <p className="text-white/60 font-bold mt-6 text-center text-[10px] uppercase tracking-widest leading-relaxed max-w-[200px]">
            Show this to <span className="text-primary">connect</span>
          </p>
        </div>
      </Card>
    </div>
  );
}
