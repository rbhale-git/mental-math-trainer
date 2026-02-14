"use client";

// Shows overall stats as cards: total problems, accuracy, avg time, streak.
interface StatsOverviewProps {
  totalProblems: number;
  totalCorrect: number;
  avgResponseTimeMs: number;
  sessionsCount: number;
}

export default function StatsOverview({
  totalProblems,
  totalCorrect,
  avgResponseTimeMs,
  sessionsCount,
}: StatsOverviewProps) {
  const accuracy =
    totalProblems > 0 ? Math.round((totalCorrect / totalProblems) * 100) : 0;
  const avgTimeSeconds = totalProblems > 0 ? (avgResponseTimeMs / 1000).toFixed(1) : "0.0";

  const stats = [
    { label: "Problems Solved", value: totalProblems.toLocaleString() },
    { label: "Accuracy", value: `${accuracy}%` },
    { label: "Avg. Time", value: `${avgTimeSeconds}s` },
    { label: "Sessions", value: sessionsCount.toLocaleString() },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map(({ label, value }) => (
        <div
          key={label}
          className="bg-white border border-gray-200 rounded-xl p-4 text-center"
        >
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{label}</p>
        </div>
      ))}
    </div>
  );
}
