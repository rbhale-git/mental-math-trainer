import Link from "next/link";
import LandingGlobe from "@/components/LandingGlobe";

export default function HomePage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <LandingGlobe />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/55 to-background/90" />

      <div className="relative z-10 flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
        {/* Hero */}
        <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-6xl">
          Train Your
          <br />
          <span className="text-primary">Mental Math</span>
        </h1>
        <p className="mb-8 max-w-md text-lg text-gray-600">
          Practice addition, subtraction, multiplication, division, and
          percentages. Track your progress and get faster every day.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-primary/30 bg-white/80 px-6 py-3 font-semibold text-olive transition-colors hover:bg-white"
          >
            Log In
          </Link>
          <Link
            href="/practice?guest=1"
            className="rounded-lg bg-accent-dark px-6 py-3 font-semibold text-white transition-colors hover:bg-olive"
          >
            Play as Guest
          </Link>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          Guest mode includes practice and assessment. Progress is not saved.
        </p>

        {/* Features */}
        <div className="mt-20 grid max-w-3xl gap-8 md:grid-cols-3">
          <div className="rounded-xl border border-primary/15 bg-white/65 p-4">
            <h3 className="mb-1 text-lg font-semibold text-gray-900">
              5 Operations
            </h3>
            <p className="text-sm text-gray-600">
              Addition, subtraction, multiplication, division, and percentages.
            </p>
          </div>
          <div className="rounded-xl border border-primary/15 bg-white/65 p-4">
            <h3 className="mb-1 text-lg font-semibold text-gray-900">
              4 Difficulty Levels
            </h3>
            <p className="text-sm text-gray-600">
              From easy single-digit problems to expert-level calculations.
            </p>
          </div>
          <div className="rounded-xl border border-primary/15 bg-white/65 p-4">
            <h3 className="mb-1 text-lg font-semibold text-gray-900">
              Track Progress
            </h3>
            <p className="text-sm text-gray-600">
              See your accuracy and speed improve over time on the dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
