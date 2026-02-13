"use client";

import { useState } from "react";
import { Heart, Instagram } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
}: {
  connection: ConnectionItem;
  votingOpen: boolean;
  matchesRevealed: boolean;
  currentProfileId: string;
  onLikeToggle: () => void;
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

  async function handleLike() {
    if (liking) return;
    setLiking(true);

    try {
      if (liked) {
        // Unlike
        const res = await fetch("/api/likes", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ liked_id: user.id }),
        });

        if (res.ok) {
          setLiked(false);
        }
      } else {
        // Like
        const res = await fetch("/api/likes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ liked_id: user.id }),
        });

        if (res.ok) {
          setLiked(true);
        } else {
          toast.error("Could not like. Voting may be closed.");
        }
      }
    } catch (error) {
      toast.error("Something went wrong");
    }

    setLiking(false);
    onLikeToggle();
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-0 rounded-3xl bg-transparent",
        matchesRevealed && isMutualMatch && "ring-4 ring-secondary shadow-[0_0_30px_rgba(255,204,0,0.4)]"
      )}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-3xl glass-panel">
        {user.avatar_url ? (
            <img 
                src={user.avatar_url} 
                alt={user.name} 
                className="w-full h-full object-cover"
            />
        ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-accent/30">
                <span className="text-6xl font-black text-white/20 select-none">{initials}</span>
            </div>
        )}
        
        {/* Overlays */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 z-10">
             <div className="mb-3">
                <h3 className="text-xl font-black tracking-tighter text-white uppercase italic leading-none truncate mb-1">
                    {user.name}
                </h3>
                {user.instagram_handle && matchesRevealed && isMutualMatch && (
                    <div className="flex items-center gap-1 text-secondary text-[10px] font-black uppercase tracking-widest opacity-90">
                        <Instagram className="h-3 w-3 stroke-[3px]" />
                        <span>{user.instagram_handle}</span>
                    </div>
                )}
             </div>

             <div className="mt-auto">
                {matchesRevealed && isMutualMatch ? (
                    <div className="w-full py-2.5 bg-secondary text-background font-black text-center text-xs rounded-full uppercase tracking-tighter shadow-lg shadow-secondary/30">
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
                            "rounded-full w-full h-10 font-black uppercase text-[10px] tracking-widest transition-all",
                            liked 
                                ? "bg-primary text-white shadow-[0_0_15px_rgba(255,0,127,0.5)]" 
                                : "bg-white/10 backdrop-blur-md text-white border border-white/20 active:bg-primary"
                        )}
                    >
                        <Heart className={cn("h-4 w-4 mr-2", liked && "fill-current")} />
                        {liked ? "LIKED" : "SEND LIKE"}
                    </Button>
                )}
             </div>
        </div>

        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-white/20 m-3 opacity-40 pointer-events-none" />
      </div>
    </Card>
  );
}
