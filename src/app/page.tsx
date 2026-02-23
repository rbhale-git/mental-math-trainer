import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 text-center">
      {/* Hero */}
      <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
        Train Your
        <br />
        <span className="text-primary">Mental Math</span>
      </h1>
      <p className="text-lg text-gray-500 max-w-md mb-8">
        Practice addition, subtraction, multiplication, division, and
        percentages. Track your progress and get faster every day.
      </p>

      {/* CTA buttons */}
      <div className="flex gap-4">
        <Link
          href="/signup"
          className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          Log In
        </Link>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-3xl">
        <div>
          <h3 className="font-semibold text-lg mb-1">5 Operations</h3>
          <p className="text-sm text-gray-500">
            Addition, subtraction, multiplication, division, and percentages.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-1">4 Difficulty Levels</h3>
          <p className="text-sm text-gray-500">
            From easy single-digit problems to expert-level calculations.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-1">Track Progress</h3>
          <p className="text-sm text-gray-500">
            See your accuracy and speed improve over time on the dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
