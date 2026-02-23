// Middleware helper that refreshes the user's auth session on every request.
// This keeps the session alive and ensures cookies stay in sync.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Start with a plain response that passes through the request
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Update cookies on the request (for downstream server code)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Also update cookies on the response (sent back to the browser)
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session - this reads/writes cookies automatically
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // /dashboard always requires auth.
  // /practice and /assessment allow guest access via ?guest=1.
  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");
  const isGuestCapableRoute =
    request.nextUrl.pathname.startsWith("/practice") ||
    request.nextUrl.pathname.startsWith("/assessment");
  const isGuestMode = request.nextUrl.searchParams.get("guest") === "1";

  if (!user && (isDashboardRoute || (isGuestCapableRoute && !isGuestMode))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
