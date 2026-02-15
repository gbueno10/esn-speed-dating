"use client";

import { useEffect, useState } from "react";
import { useAppSettings } from "@/components/app-settings-provider";
import { ConnectionGrid } from "@/components/connection-grid";
import { MatchProfileModal } from "@/components/match-profile-modal";
import { TondelaModal } from "@/components/tondela-modal";
import { FeedbackModal } from "@/components/feedback-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Clock, Heart, Sparkles, Timer } from "lucide-react";
import type { SpeedDatingProfile } from "@/lib/types/database";

const TONDELA_CONNECTION = {
  id: "tondela",
  user: {
    id: "tondela",
    name: "Tondela",
    avatar_url: "/tondela.png",
    nationality: "PT",
    instagram_handle: null,
    gender: null,
    interested_in: null,
  },
  iLikedThem: true,
  theyLikedMe: true,
  isMutualMatch: true,
};

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
  const [selectedProfile, setSelectedProfile] = useState<SpeedDatingProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedIsMutualMatch, setSelectedIsMutualMatch] = useState(false);
  const [showTondelaModal, setShowTondelaModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const { is_voting_open, are_matches_revealed } = useAppSettings();

  useEffect(() => {
    // Definir 3 dias a partir de agora (18 de fevereiro de 2026, já que hoje é 15)
    const targetDate = new Date("2026-02-18T23:59:59");
    
    const timer = setInterval(() => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft("Expired");
        clearInterval(timer);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        setTimeLeft(`${days}d ${hours}h ${mins}m`);
      }
    }, 1000);

    // Abrir feedback após 5 segundos se os matches estiverem revelados
    if (are_matches_revealed) {
      const fbTimer = setTimeout(() => setShowFeedbackModal(true), 5000);
      return () => {
        clearInterval(timer);
        clearTimeout(fbTimer);
      };
    }

    return () => clearInterval(timer);
  }, [are_matches_revealed]);

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
    return <LoadingScreen message="Loading Connections" />;
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
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 text-red-700 dark:text-red-300 p-4 rounded-xl text-sm font-semibold shadow-md border-2 border-red-300 dark:border-red-700/30 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="bg-red-500 p-2 rounded-lg animate-pulse">
                <Sparkles className="h-5 w-5 shrink-0 text-white" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-base">
                  ✨ You have {matchCount} mutual{" "}
                  {matchCount === 1 ? "match" : "matches"}!
                </span>
                <span className="text-xs font-normal opacity-80">
                  ⚠️ App closes & data deleted in 3 days - message your matches now!
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end border-l border-red-200 dark:border-red-800/50 pl-4">
                  <span className="text-[9px] uppercase tracking-tighter opacity-70 flex items-center gap-1">
                    <Timer className="h-3 w-3" /> Deletes in
                  </span>
                  <span className="text-xs font-black font-mono">{timeLeft}</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full rounded-xl border-dashed border-2 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-primary hover:border-primary transition-all py-6 h-auto flex flex-col gap-1"
            onClick={() => setShowFeedbackModal(true)}
          >
            <span className="text-sm font-bold">Feedback / Give your opinion</span>
            <span className="text-[10px] opacity-60">Help us improve next semester's events!</span>
          </Button>
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
        connections={[TONDELA_CONNECTION, ...connections]}
        votingOpen={is_voting_open}
        matchesRevealed={are_matches_revealed}
        currentProfileId={profileId}
        onLikeToggle={fetchConnections}
        onCardClick={(connection) => {
          if (connection.id === "tondela") {
            setShowTondelaModal(true);
            return;
          }
          setSelectedProfile(connection.user);
          setSelectedIsMutualMatch(connection.isMutualMatch);
          setShowProfileModal(true);
        }}
      />

      <MatchProfileModal
        profile={selectedProfile}
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
        isMutualMatch={selectedIsMutualMatch}
      />

      <TondelaModal
        open={showTondelaModal}
        onOpenChange={setShowTondelaModal}
      />

      <FeedbackModal 
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </div>
  );
}
