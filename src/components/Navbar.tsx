"use client";

// Navigation bar shown at the top of every page.
// Shows different links depending on whether the user is logged in.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo / App name */}
        <Link href="/" className="text-xl font-bold text-gray-900">
          MentalMath
        </Link>

        {/* Navigation links */}
        <div className="flex items-center gap-4">
          {loading ? (
            // Show nothing while checking auth state
            <div className="w-20 h-8" />
          ) : user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/practice"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Practice
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
