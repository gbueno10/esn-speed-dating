import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { liked_id } = await request.json();

    if (!liked_id) {
      return NextResponse.json(
        { error: "liked_id is required" },
        { status: 400 }
      );
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

    // Insert like
    const { error } = await supabase.from("speed_dating_likes").insert({
      liker_id: myProfile.id,
      liked_id,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { liked_id } = await request.json();

    if (!liked_id) {
      return NextResponse.json(
        { error: "liked_id is required" },
        { status: 400 }
      );
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

    // Delete like
    const { error } = await supabase
      .from("speed_dating_likes")
      .delete()
      .eq("liker_id", myProfile.id)
      .eq("liked_id", liked_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
