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

  // Mock interests for design demo
  const interests = ["Travel", "Music", "Cinema"];

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
        "cyber-card overflow-hidden transition-all hover:scale-[1.02] duration-300 border-0",
        matchesRevealed &&
          isMutualMatch &&
          "ring-4 ring-secondary shadow-[0_0_30px_rgba(255,204,0,0.6)] animate-pulse-slow"
      )}
    >
      <div className="relative h-64 w-full bg-muted group">
        {user.avatar_url ? (
            <img 
                src={user.avatar_url} 
                alt={user.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
        ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/20">
                <span className="text-6xl font-extrabold text-primary/50">{initials}</span>
            </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#240046] via-[#240046]/90 to-transparent" />
        
        <div className="absolute bottom-4 left-4 right-4 text-white">
             <h3 className="text-2xl font-extrabold tracking-tight leading-none drop-shadow-md">
                {user.name ?? "Anonymous"}
             </h3>
             {user.instagram_handle && (
                <div className="flex items-center gap-1.5 text-secondary text-sm font-bold mt-1 drop-shadow-sm">
                    <Instagram className="h-3.5 w-3.5" />
                    <span>@{user.instagram_handle}</span>
                </div>
             )}
        </div>
      </div>

      <CardContent className="p-5 bg-card relative space-y-4">
          <div className="flex flex-wrap gap-2">
            {interests.map((tag) => (
                <Badge 
                    key={tag} 
                    className="rounded-full bg-primary/20 hover:bg-primary text-primary hover:text-white border-0 text-[10px] px-3 py-1 font-bold uppercase tracking-wider transition-colors"
                >
                    {tag}
                </Badge>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            {matchesRevealed && isMutualMatch ? (
                <div className="w-full py-3 bg-secondary text-[#240046] font-black text-center text-lg rounded-full animate-bounce shadow-lg shadow-secondary/50">
                    IT'S A MATCH!
                </div>
            ) : (
                <Button
                    onClick={handleLike}
                    disabled={votingOpen === false}
                    className={cn(
                        "rounded-full w-14 h-14 p-0 shadow-xl transition-all duration-300",
                        liked 
                            ? "bg-primary text-white shadow-primary/60 glitch-hover scale-110" 
                            : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-white hover:scale-105"
                    )}
                >
                    <Heart className={cn("h-7 w-7", liked && "fill-current")} />
                </Button>
            )}
          </div>
      </CardContent>
    </Card>
  );
}
