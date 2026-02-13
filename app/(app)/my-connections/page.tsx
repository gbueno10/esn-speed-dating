"use client";

import { useEffect, useState } from "react";
import { useAppSettings } from "@/components/app-settings-provider";
import { ConnectionGrid } from "@/components/connection-grid";
import { Badge } from "@/components/ui/badge";
import { Clock, Heart, Sparkles } from "lucide-react";

type ConnectionItem = {
  id: string;
  user: any;
  iLikedThem: boolean;
  theyLikedMe: boolean;
  isMutualMatch: boolean;
};

export default function MyConnectionsPage() {
  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [profileId, setProfileId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { is_voting_open, are_matches_revealed } = useAppSettings();

  async function fetchConnections() {
    try {
      const res = await fetch("/api/connections");
      const data = await res.json();

      if (res.ok) {
        setConnections(data.connections);
        setProfileId(data.profileId);
      }
    } catch (error) {
      console.error("Error fetching connections:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchConnections();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const matchCount = connections.filter((c) => c.isMutualMatch).length;

  return (
    <div className="space-y-4">
      {/* Status banner */}
      {!is_voting_open && !are_matches_revealed && (
        <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 text-amber-700 dark:text-amber-400 p-4 rounded-xl text-sm font-medium shadow-sm border border-amber-200 dark:border-amber-800/30 animate-fade-in">
          <div className="bg-amber-500/20 p-2 rounded-lg">
            <Clock className="h-5 w-5 shrink-0" />
          </div>
          <span>Keep scanning! Voting will open soon...</span>
        </div>
      )}

      {is_voting_open && !are_matches_revealed && (
        <div className="flex items-center gap-3 esn-gradient text-white p-4 rounded-xl text-sm font-semibold shadow-md animate-fade-in">
          <div className="bg-white/20 p-2 rounded-lg">
            <Heart className="h-5 w-5 shrink-0" />
          </div>
          <span>Voting is open! Tap the heart on people you liked meeting.</span>
        </div>
      )}

      {are_matches_revealed && (
        <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 text-purple-700 dark:text-purple-300 p-4 rounded-xl text-sm font-semibold shadow-md border-2 border-purple-300 dark:border-purple-700/30 animate-fade-in">
          <div className="esn-gradient p-2 rounded-lg">
            <Sparkles className="h-5 w-5 shrink-0 text-white" />
          </div>
          <span>
            ✨ Matches revealed! You have {matchCount} mutual{" "}
            {matchCount === 1 ? "match" : "matches"}!
          </span>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <h2 className="text-xl font-bold flex items-center gap-2">
          My Connections
          <Badge variant="secondary" className="esn-gradient text-white font-bold px-3 py-1">
            {connections.length}
          </Badge>
        </h2>
      </div>

      <ConnectionGrid
        connections={connections}
        votingOpen={is_voting_open}
        matchesRevealed={are_matches_revealed}
        currentProfileId={profileId}
        onLikeToggle={fetchConnections}
      />
    </div>
  );
}
