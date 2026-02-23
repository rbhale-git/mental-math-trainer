import Link from "next/link";
import LandingGlobe from "@/components/LandingGlobe";

export default function HomePage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <LandingGlobe />
      <div className="absolute inset-0 bg-gradient-to-b from-background/45 via-background/65 to-background/95" />

      <div className="relative z-10 flex min-h-[calc(100vh-4rem)] flex-col items-center justify-start px-4 pb-10 pt-10 text-center md:justify-center md:pb-0 md:pt-0">
        {/* Hero */}
        <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          Train Your
          <br />
          <span className="text-primary">Mental Math</span>
        </h1>
        <p className="mb-6 max-w-[22rem] text-base text-gray-600 sm:mb-8 sm:max-w-md sm:text-lg">
          Practice addition, subtraction, multiplication, division, and
          percentages. Track your progress and get faster every day.
        </p>

        {/* CTA buttons */}
        <div className="flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
          <Link
            href="/signup"
            className="w-full rounded-lg bg-primary px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-primary-dark sm:w-auto"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="w-full rounded-lg border border-primary/30 bg-white/80 px-6 py-3 text-center font-semibold text-olive transition-colors hover:bg-white sm:w-auto"
          >
            Log In
          </Link>
          <Link
            href="/practice?guest=1"
            className="w-full rounded-lg bg-accent-dark px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-olive sm:w-auto"
          >
            Play as Guest
          </Link>
        </div>
        <p className="mt-3 max-w-sm text-xs text-gray-500 sm:text-sm">
          Guest mode includes practice and assessment. Progress is not saved.
        </p>

        {/* Features */}
        <div className="mt-10 grid w-full max-w-3xl gap-4 sm:mt-14 sm:gap-5 md:mt-16 md:grid-cols-3 md:gap-6">
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
