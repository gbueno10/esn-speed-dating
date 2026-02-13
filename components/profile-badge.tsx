"use client";

import { QRCodeSVG } from "qrcode.react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { SpeedDatingProfile } from "@/lib/types/database";

export function ProfileBadge({ profile }: { profile: SpeedDatingProfile }) {
  const initials = (profile.name ?? "Anonymous")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="cyber-card overflow-hidden animate-fade-in border-0 max-w-sm mx-auto mt-4">
      <div className="relative p-8 text-white text-center overflow-hidden bg-gradient-to-b from-primary/20 to-background">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col items-center">
          <Avatar className="h-28 w-28 mx-auto mb-4 border-4 border-secondary/50 shadow-[0_0_20px_rgba(255,204,0,0.3)] animate-scale-in">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback className="text-2xl bg-primary text-white font-extrabold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-3xl font-black mb-1 tracking-tight glitch-hover" data-text={profile.name ?? "Anonymous"}>
            {(profile.name ?? "Anonymous")}
          </h2>
          <p className="text-secondary font-bold tracking-widest text-xs uppercase opacity-90">ESN Cyber Speed Dating</p>
        </div>
      </div>

      <CardContent className="flex flex-col items-center py-10 bg-card relative">
        <div className="bg-white p-4 rounded-3xl shadow-2xl animate-slide-up border-4 border-primary/30 ring-4 ring-primary/10 transition-all hover:scale-105 duration-300">
          <QRCodeSVG
            value={profile.id}
            size={200}
            level="M"
            includeMargin={false}
            fgColor="#240046" 
            bgColor="#ffffff"
          />
        </div>
        <p className="text-muted-foreground mt-8 text-center max-w-xs font-medium leading-relaxed">
          Show this <span className="text-primary font-bold">QR Code</span> to others so they can scan and connect with you!
        </p>
      </CardContent>
    </Card>
  );
}
