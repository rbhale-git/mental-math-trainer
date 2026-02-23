"use client";

// Dashboard page — shows the user's overall stats, assessment skill levels,
// and per-operation performance. Fetches data from Supabase on mount.
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import StatsOverview from "@/components/StatsOverview";
import PerformanceChart from "@/components/PerformanceChart";
import AssessmentPrompt from "@/components/AssessmentPrompt";
import Link from "next/link";
import type { PerformanceMetric, AssessmentResult, Difficulty } from "@/lib/types";

const OPERATION_LABELS: Record<string, string> = {
  add: "Addition",
  subtract: "Subtraction",
  multiply: "Multiplication",
  divide: "Division",
  percentage: "Percentage",
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: "bg-primary/15 text-primary",
  medium: "bg-accent/20 text-accent-dark",
  hard: "bg-accent-dark/15 text-accent-dark",
  expert: "bg-olive/15 text-olive",
};

const RATING_COLORS: Record<string, string> = {
  Beginner: "text-primary",
  Intermediate: "text-accent-dark",
  Advanced: "text-accent-dark",
  Expert: "text-olive",
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalProblems, setTotalProblems] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [avgResponseTimeMs, setAvgResponseTimeMs] = useState(0);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [assessmentLoaded, setAssessmentLoaded] = useState(false);

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

      // Fetch latest assessment
      const { data: assessmentData } = await supabase
        .from("assessments")
        .select("*")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(1)
        .single();
      setAssessment(assessmentData as AssessmentResult | null);
      setAssessmentLoaded(true);

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

  const assessmentLevels = assessment
    ? [
        { key: "add", level: assessment.add_level },
        { key: "subtract", level: assessment.subtract_level },
        { key: "multiply", level: assessment.multiply_level },
        { key: "divide", level: assessment.divide_level },
        { key: "percentage", level: assessment.percentage_level },
      ]
    : [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link
          href="/practice"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
        >
          Start Practice
        </Link>
      </div>

      {/* Assessment section */}
      {assessmentLoaded && !assessment && <AssessmentPrompt />}

      {assessment && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Skill Levels</h2>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-bold ${RATING_COLORS[assessment.overall_rating] ?? ""}`}>
                {assessment.overall_rating}
              </span>
              <Link
                href="/assessment"
                className="text-sm text-primary hover:text-primary-dark transition-colors font-medium"
              >
                Retake Assessment
              </Link>
            </div>
          </div>
          <div className="space-y-2">
            {assessmentLevels.map(({ key, level }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {OPERATION_LABELS[key]}
                </span>
                <span
                  className={`px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${DIFFICULTY_COLORS[level]}`}
                >
                  {level}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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
