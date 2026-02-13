"use client";

import { ConnectionCard } from "@/components/connection-card";
import { Users } from "lucide-react";

type ConnectionItem = {
  id: string;
  user: any;
  iLikedThem: boolean;
  theyLikedMe: boolean;
  isMutualMatch: boolean;
};

export function ConnectionGrid({
  connections,
  votingOpen,
  matchesRevealed,
  currentProfileId,
  onLikeToggle,
}: {
  connections: ConnectionItem[];
  votingOpen: boolean;
  matchesRevealed: boolean;
  currentProfileId: string;
  onLikeToggle: () => void;
}) {
  if (connections.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground animate-fade-in">
        <div className="bg-gradient-to-br from-primary to-secondary w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-[length:200%_200%] animate-pulse">
          <Users className="h-10 w-10 text-white" />
        </div>
        <p className="text-lg font-bold text-white mb-2">No connections yet</p>
        <p className="text-sm text-muted-foreground">
          Tap the scan button to start meeting people!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 pb-24 px-1">
      {connections.map((conn, index) => (
        <div
          key={conn.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <ConnectionCard
            connection={conn}
            votingOpen={votingOpen}
            matchesRevealed={matchesRevealed}
            currentProfileId={currentProfileId}
            onLikeToggle={onLikeToggle}
          />
        </div>
      ))}
    </div>
  );
}
