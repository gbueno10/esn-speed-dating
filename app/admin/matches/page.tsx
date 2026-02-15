"use client";

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Search, Heart, RefreshCw, User, Users } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { SpeedDatingProfile } from "@/lib/types/database";

type MatchResult = SpeedDatingProfile & {
  iLikedThem: boolean;
  theyLikedMe: boolean;
  isMutual: boolean;
};

export default function AdminMatchesPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading Match Explorer..." />}>
      <MatchExplorerContent />
    </Suspense>
  );
}

function MatchExplorerContent() {
  const searchParams = useSearchParams();
  const userIdParam = searchParams.get("userId");

  const [searchTerm, setSearchTerm] = useState("");
  const [allUsers, setAllUsers] = useState<SpeedDatingProfile[]>([]);
  const [users, setUsers] = useState<SpeedDatingProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<SpeedDatingProfile | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "all" | "mutual" | "sent" | "received">("profile");

  // Initial fetch of ALL users
  useEffect(() => {
    async function fetchInitialUsers() {
      setSearchLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("speed_dating_profiles")
        .select("*")
        .order("name", { ascending: true });
      
      if (data) {
        setUsers(data);
        setAllUsers(data); // Store full list for local filtering
      }
      setSearchLoading(false);
    }
    fetchInitialUsers();
  }, []);

  // Filter users based on searchTerm (Local filtering for speed)
  useEffect(() => {
    if (!searchTerm) {
      setUsers(allUsers);
      return;
    }

    const filtered = allUsers.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setUsers(filtered);
  }, [searchTerm, allUsers]);

  async function fetchMatches(profile: SpeedDatingProfile) {
    setLoading(true);
    setSelectedUser(profile);
    
    // Update URL without refreshing
    const params = new URLSearchParams(window.location.search);
    params.set("userId", profile.id);
    window.history.replaceState(null, "", `?${params.toString()}`);

    const supabase = createClient();

    // Fetch all likes from this user
    const { data: myLikes } = await supabase
      .from("speed_dating_likes")
      .select("liked_id")
      .eq("liker_id", profile.id);

    // Fetch all likes to this user
    const { data: likesToMe } = await supabase
      .from("speed_dating_likes")
      .select("liker_id")
      .eq("liked_id", profile.id);

    const myLikedIds = new Set(myLikes?.map(l => l.liked_id) || []);
    const theyLikedMeIds = new Set(likesToMe?.map(l => l.liker_id) || []);

    // All unique IDs where there's a like involved
    const allRelatedIds = Array.from(new Set([...myLikedIds, ...theyLikedMeIds]));

    if (allRelatedIds.length === 0) {
      setMatches([]);
      setLoading(false);
      return;
    }

    const { data: profileDetails } = await supabase
      .from("speed_dating_profiles")
      .select("*")
      .in("id", allRelatedIds);

    if (profileDetails) {
      setMatches(profileDetails.map(p => {
        const iLikedThem = myLikedIds.has(p.id);
        const theyLikedMe = theyLikedMeIds.has(p.id);
        return { 
          ...p, 
          iLikedThem,
          theyLikedMe,
          isMutual: iLikedThem && theyLikedMe 
        };
      }));
    }

    setLoading(false);
  }

  // Handle URL userId param on mount
  useEffect(() => {
    if (userIdParam && (!selectedUser || selectedUser.id !== userIdParam)) {
      const fetchProfileAndMatches = async () => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("speed_dating_profiles")
          .select("*")
          .eq("id", userIdParam)
          .single();

        if (data && !error) {
          fetchMatches(data);
        }
      };
      fetchProfileAndMatches();
    }
  }, [userIdParam]);

  return (
    <div className="min-h-svh bg-background p-4 flex flex-col items-center">
      <header className="w-full max-w-2xl px-4 py-6 text-center">
        <div className="flex justify-between items-center mb-4">
          <Link href="/admin" className="text-secondary hover:text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            ← Back to Control
          </Link>
        </div>
        <h1 className="text-3xl font-black text-white glitch-hover" data-text="MATCH EXPLORER">MATCH EXPLORER</h1>
        <p className="text-secondary font-bold tracking-widest text-xs uppercase mt-1">Audit mutual connections</p>
      </header>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: User Selection */}
        <div className="md:col-span-5 space-y-4">
            <Card className="event-card border-none bg-card/50 sticky top-4">
                <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center gap-2 mb-2 px-1">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-xs font-black text-white uppercase tracking-widest">Select Participant</span>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                        <Input
                            placeholder="Search name or @handle..."
                            className="pl-10 bg-white/5 border-white/10 text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {searchLoading && (
                            <div className="py-8 text-center animate-pulse text-white/20 text-xs font-bold uppercase">
                                Syncing Database...
                            </div>
                        )}
                        {users.map((user) => (
                            <button
                                key={user.id}
                                onClick={() => fetchMatches(user)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                                    selectedUser?.id === user.id ? "bg-primary text-black" : "bg-white/5 text-white hover:bg-white/10"
                                }`}
                            >
                                <Avatar className="h-8 w-8 border border-white/20">
                                    <AvatarImage src={user.avatar_url || ""} />
                                    <AvatarFallback className="bg-white/10 text-[10px]"><User className="h-4 w-4" /></AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col items-start overflow-hidden">
                                    <span className="font-bold text-sm truncate w-full text-left">{user.name}</span>
                                    <span className={`text-[10px] uppercase font-black tracking-tighter ${selectedUser?.id === user.id ? "text-black/60" : "text-white/40"}`}>
                                        @{user.instagram_handle}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Right Column: Matches Details */}
        <div className="md:col-span-7 space-y-4">
            {selectedUser ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <Heart className="h-4 w-4 text-primary fill-primary" />
                                <h2 className="text-sm font-black text-white uppercase tracking-widest">
                                    Audit {selectedUser.name}
                                </h2>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                            {[
                                { id: "profile", label: "Profile" },
                                { id: "all", label: "All" },
                                { id: "mutual", label: "Matches" },
                                { id: "sent", label: "Sent" },
                                { id: "received", label: "Received" }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                                        activeTab === tab.id ? "bg-primary text-black" : "text-white/40 hover:text-white"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {activeTab === "profile" ? (
                        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                            <Card className="event-card border-none bg-white/5 overflow-hidden">
                                <CardContent className="p-8 flex flex-col items-center text-center">
                                    <Avatar className="h-32 w-32 border-4 border-primary/20 mb-6 shadow-2xl">
                                        <AvatarImage src={selectedUser.avatar_url || ""} />
                                        <AvatarFallback className="text-4xl"><User className="h-16 w-16" /></AvatarFallback>
                                    </Avatar>
                                    <h3 className="text-2xl font-black text-white mb-1 uppercase tracking-tight">{selectedUser.name}</h3>
                                    <p className="text-primary font-black uppercase tracking-widest text-sm mb-6">@{selectedUser.instagram_handle}</p>
                                    
                                    <div className="grid grid-cols-2 gap-4 w-full">
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-left">
                                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest block mb-1">Gender</span>
                                            <span className="text-white font-bold uppercase text-xs">{selectedUser.gender || "Not specified"}</span>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-left">
                                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest block mb-1">Interested In</span>
                                            <span className="text-white font-bold uppercase text-xs">{selectedUser.interested_in || "Not specified"}</span>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-left">
                                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest block mb-1">Nationality</span>
                                            <span className="text-white font-bold uppercase text-xs">{selectedUser.nationality || "Unknown"}</span>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-left">
                                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest block mb-1">Created At</span>
                                            <span className="text-white font-bold uppercase text-[10px]">{new Date(selectedUser.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="mt-8 w-full">
                                        <Link 
                                            href={`https://instagram.com/${selectedUser.instagram_handle.replace('@', '')}`} 
                                            target="_blank"
                                            className="w-full bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-xs"
                                        >
                                            View Instagram Profile ↗
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : loading ? (
                        <div className="flex flex-col items-center justify-center p-20 bg-white/5 rounded-3xl border border-white/5">
                            <RefreshCw className="h-10 w-10 text-primary animate-spin mb-4" />
                            <span className="text-xs font-black text-white/40 uppercase tracking-widest">Calculating Mutuals...</span>
                        </div>
                    ) : (() => {
                        const filtered = matches.filter(m => {
                            if (activeTab === "mutual") return m.isMutual;
                            if (activeTab === "sent") return m.iLikedThem && !m.theyLikedMe;
                            if (activeTab === "received") return m.theyLikedMe && !m.iLikedThem;
                            return true;
                        });

                        return filtered.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3">
                                {filtered.map((match) => (
                                    <Card key={match.id} className="event-card border-none bg-white/5 overflow-hidden group">
                                        <div className={`absolute inset-y-0 left-0 w-1 transform -translate-x-full group-hover:translate-x-0 transition-transform ${
                                            match.isMutual ? "bg-primary" : "bg-white/20"
                                        }`} />
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <Avatar className={`h-12 w-12 border-2 ${match.isMutual ? "border-primary/20" : "border-white/10"}`}>
                                                    <AvatarImage src={match.avatar_url || ""} />
                                                    <AvatarFallback><User /></AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-bold text-white text-base">{match.name}</div>
                                                    <div className="text-xs text-primary font-black uppercase tracking-tighter flex items-center gap-1">
                                                        @{match.instagram_handle}
                                                        <Link 
                                                            href={`https://instagram.com/${match.instagram_handle.replace('@', '')}`} 
                                                            target="_blank"
                                                            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity underline decoration-primary/30"
                                                        >
                                                            Profile ↗
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {match.isMutual ? (
                                                    <Badge className="bg-primary hover:bg-primary text-black font-black px-3 py-1 text-[10px]">MUTUAL MATCH</Badge>
                                                ) : (
                                                    <>
                                                        {match.iLikedThem && <Badge variant="outline" className="text-white/40 border-white/20 font-black text-[10px]">THEY LIKED</Badge>}
                                                        {match.theyLikedMe && <Badge variant="outline" className="text-primary/60 border-primary/20 font-black text-[10px]">LIKED BY THEM</Badge>}
                                                    </>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 flex flex-col items-center">
                                <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <Heart className="h-6 w-6 text-white/10" />
                                </div>
                                <p className="text-white/40 text-sm font-bold uppercase tracking-widest">No results in this category.</p>
                            </div>
                        );
                    })()}
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center p-20 bg-white/5 rounded-3xl border border-dashed border-white/10 opacity-40">
                    <Users className="h-12 w-12 text-white/20 mb-4" />
                    <p className="text-sm font-black uppercase tracking-widest text-white/40">Select a participant to audit</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
