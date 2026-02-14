"use client";

import { useState } from "react";
import { Heart, Instagram } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { COUNTRIES } from "@/components/nationality-picker";

type ConnectionItem = {
  id: string;
  user: any;
  iLikedThem: boolean;
  theyLikedMe: boolean;
  isMutualMatch: boolean;
};

export function ConnectionCard({
  connection,
  votingOpen,
  matchesRevealed,
  currentProfileId,
  onLikeToggle,
  onCardClick,
}: {
  connection: ConnectionItem;
  votingOpen: boolean;
  matchesRevealed: boolean;
  currentProfileId: string;
  onLikeToggle: () => void;
  onCardClick?: () => void;
}) {
  const [liking, setLiking] = useState(false);
  const [liked, setLiked] = useState(connection.iLikedThem);
  const { user, isMutualMatch } = connection;

  const initials = (user.name ?? "Anonymous")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const country = user.nationality
    ? COUNTRIES.find((c: any) => c.code === user.nationality)
    : null;

  async function handleLike() {
    if (liking) return;
    setLiking(true);

    const wasLiked = liked;
    setLiked(!wasLiked); // optimistic update

    try {
      const res = await fetch("/api/likes", {
        method: wasLiked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liked_id: user.id }),
      });

      if (!res.ok) {
        setLiked(wasLiked); // revert on failure
        toast.error(wasLiked ? "Could not unlike." : "Could not like. Voting may be closed.");
      }
    } catch {
      setLiked(wasLiked); // revert on error
      toast.error("Something went wrong");
    }

    setLiking(false);
    onLikeToggle();
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-0 rounded-2xl bg-transparent cursor-pointer transition-transform active:scale-[0.97]",
        matchesRevealed && isMutualMatch && user.id !== "tondela" && "ring-2 ring-secondary shadow-[0_0_20px_rgba(255,204,0,0.3)]",
        user.id === "tondela" && "ring-2 ring-primary/50 shadow-[0_0_15px_rgba(255,0,127,0.2)]"
      )}
      onClick={onCardClick}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
        {user.avatar_url ? (
            <img
                src={user.avatar_url}
                alt={user.name}
                className="w-full h-full object-cover"
            />
        ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-accent/30">
                <span className="text-5xl font-black text-white/20 select-none">{initials}</span>
            </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-3 z-10">
             <div className="mb-2">
                <h3 className="text-base font-black tracking-tight text-white leading-none truncate mb-0.5">
                    {user.name}
                </h3>
                {country && (
                    <div className="flex items-center gap-1 mb-1">
                        <span className="text-sm">{country.flag}</span>
                        <span className="text-[9px] font-semibold text-white/60 tracking-wide">
                            {country.name}
                        </span>
                    </div>
                )}
                {user.instagram_handle && matchesRevealed && isMutualMatch && (
                    <div className="flex items-center gap-1 text-secondary text-[9px] font-bold tracking-wide opacity-90">
                        <Instagram className="h-2.5 w-2.5 stroke-[2.5px]" />
                        <span>{user.instagram_handle}</span>
                    </div>
                )}
             </div>

             <div>
                {user.id === "tondela" ? (
                    <div className="w-full py-2 bg-gradient-to-r from-primary to-accent text-white font-black text-center text-[10px] rounded-full uppercase tracking-tight shadow-md">
                        TAP FOR TIPS
                    </div>
                ) : matchesRevealed && isMutualMatch ? (
                    <div className="w-full py-2 bg-secondary text-background font-black text-center text-[10px] rounded-full uppercase tracking-tight shadow-md shadow-secondary/20">
                        IT'S A MATCH!
                    </div>
                ) : (
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleLike();
                        }}
                        disabled={votingOpen === false}
                        size="sm"
                        className={cn(
                            "rounded-full w-full h-8 font-bold uppercase text-[9px] tracking-wider transition-all",
                            liked
                                ? "bg-primary text-white shadow-[0_0_12px_rgba(255,0,127,0.4)]"
                                : "bg-white/10 backdrop-blur-md text-white border border-white/20 active:bg-primary"
                        )}
                    >
                        <Heart className={cn("h-3 w-3 mr-1.5", liked && "fill-current")} />
                        {liked ? "LIKED" : "LIKE"}
                    </Button>
                )}
             </div>
        </div>
      </div>
    </Card>
  );
}
