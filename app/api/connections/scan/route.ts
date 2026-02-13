import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { scanned_id } = await request.json();

    if (!scanned_id || !UUID_REGEX.test(scanned_id)) {
      return NextResponse.json({ error: "Invalid QR code" }, { status: 400 });
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

    const currentProfileId = myProfile.id;

    if (scanned_id === currentProfileId) {
      return NextResponse.json(
        { error: "You scanned yourself!" },
        { status: 400 }
      );
    }

    // Insert bidirectional connections
    const { error: error1 } = await supabase
      .from("speed_dating_connections")
      .insert({
        scanner_id: currentProfileId,
        scanned_id: scanned_id,
      });

    // Insert reverse connection (ignore duplicate error)
    await supabase.from("speed_dating_connections").insert({
      scanner_id: scanned_id,
      scanned_id: currentProfileId,
    });

    if (error1?.code === "23505") {
      return NextResponse.json(
        { error: "Already connected!", alreadyConnected: true },
        { status: 409 }
      );
    }

    if (error1) {
      return NextResponse.json(
        { error: "Something went wrong. Try again!" },
        { status: 500 }
      );
    }

    // Fetch scanned person's name
    const { data: profile } = await supabase
      .from("speed_dating_profiles")
      .select("name")
      .eq("id", scanned_id)
      .single();

    return NextResponse.json({
      success: true,
      name: profile?.name ?? "someone new",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
