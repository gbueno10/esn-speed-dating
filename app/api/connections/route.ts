import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's profile ID
    const { data: myProfile } = await supabase
      .from("speed_dating_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!myProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const profileId = myProfile.id;

    // Get all my connections (I'm the scanner, they're the scanned)
    const { data: myConnections } = await supabase
      .from("speed_dating_connections")
      .select(
        "id, scanned_id, scanned:speed_dating_profiles!speed_dating_connections_scanned_id_fkey(*)"
      )
      .eq("scanner_id", profileId);

    // Get my outgoing likes
    const { data: myLikes } = await supabase
      .from("speed_dating_likes")
      .select("liked_id")
      .eq("liker_id", profileId);

    // Get incoming likes (only works when matches are revealed due to RLS)
    const { data: incomingLikes } = await supabase
      .from("speed_dating_likes")
      .select("liker_id")
      .eq("liked_id", profileId);

    const myLikedIds = new Set(myLikes?.map((l) => l.liked_id) ?? []);
    const theyLikedMeIds = new Set(
      incomingLikes?.map((l) => l.liker_id) ?? []
    );

    const connections =
      (myConnections ?? []).map((c: any) => {
        const user = c.scanned as any;
        const iLikedThem = myLikedIds.has(user?.id);
        const theyLikedMe = theyLikedMeIds.has(user?.id);
        return {
          id: c.id,
          user,
          iLikedThem,
          theyLikedMe,
          isMutualMatch: iLikedThem && theyLikedMe,
        };
      });

    return NextResponse.json({ connections, profileId });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
