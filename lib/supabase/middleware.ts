import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: "speed_dating" },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtected =
    pathname.startsWith("/my-") ||
    pathname.startsWith("/scan") ||
    pathname.startsWith("/admin");

  // Not logged in → can't access app
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/signup";
    return NextResponse.redirect(url);
  }

  // Logged in → check if profile exists for this edition
  if (user) {
    const { data: profile } = await supabase
      .from("speed_dating_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    // No profile → force onboarding (stay on /signup)
    if (!profile && isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/signup";
      return NextResponse.redirect(url);
    }

    // Has profile → block /signup and /login
    if (profile && (pathname === "/login" || pathname === "/signup")) {
      const url = request.nextUrl.clone();
      url.pathname = "/my-badge";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
