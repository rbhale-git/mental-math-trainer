// proxy.ts — Next.js 16 replacement for middleware.ts
// Runs on every request to refresh the user's Supabase auth session
// and protect routes that require login.
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export default async function proxy(request: NextRequest) {
  return await updateSession(request);
}

// Define which routes this proxy applies to.
// This matcher skips static files and images for performance.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
