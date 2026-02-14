"use client";

// Dashboard page — shows the user's overall stats and per-operation performance.
// Fetches data from Supabase on mount.
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import StatsOverview from "@/components/StatsOverview";
import PerformanceChart from "@/components/PerformanceChart";
import Link from "next/link";
import type { PerformanceMetric } from "@/lib/types";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalProblems, setTotalProblems] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [avgResponseTimeMs, setAvgResponseTimeMs] = useState(0);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      const supabase = createClient();

      // Fetch all problems for this user to compute totals
      const { data: problems } = await supabase
        .from("problems")
        .select("is_correct, response_time_ms")
        .eq("user_id", user.id);

      if (problems) {
        setTotalProblems(problems.length);
        setTotalCorrect(problems.filter((p) => p.is_correct).length);
        const totalTime = problems.reduce(
          (sum, p) => sum + p.response_time_ms,
          0
        );
        setAvgResponseTimeMs(
          problems.length > 0 ? Math.round(totalTime / problems.length) : 0
        );
      }

      // Count sessions
      const { count } = await supabase
        .from("sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      setSessionsCount(count ?? 0);

      // Fetch performance metrics
      const { data: metricsData } = await supabase
        .from("performance_metrics")
        .select("*")
        .eq("user_id", user.id);
      setMetrics((metricsData as PerformanceMetric[]) ?? []);

      setLoading(false);
    };

    fetchStats();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-center text-gray-400">Loading your stats...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link
          href="/practice"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Start Practice
        </Link>
      </div>

      {/* Overall stats cards */}
      <StatsOverview
        totalProblems={totalProblems}
        totalCorrect={totalCorrect}
        avgResponseTimeMs={avgResponseTimeMs}
        sessionsCount={sessionsCount}
      />

      {/* Per-operation performance bars */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <PerformanceChart metrics={metrics} />
      </div>
    </div>
  );
}
