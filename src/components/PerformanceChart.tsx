"use client";

// Simple bar chart showing accuracy per operation.
// Built with pure CSS — no chart library needed.
import type { PerformanceMetric } from "@/lib/types";

const OPERATION_LABELS: Record<string, string> = {
  add: "Addition",
  subtract: "Subtraction",
  multiply: "Multiplication",
  divide: "Division",
  percentage: "Percentage",
};

interface PerformanceChartProps {
  metrics: PerformanceMetric[];
}

export default function PerformanceChart({ metrics }: PerformanceChartProps) {
  if (metrics.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No practice data yet. Start a practice session to see your stats!
      </div>
    );
  }

  // Group metrics by operation and average the accuracy
  const byOperation: Record<string, { accuracy: number; attempts: number; avgTime: number }> = {};
  for (const m of metrics) {
    if (!byOperation[m.operation]) {
      byOperation[m.operation] = { accuracy: 0, attempts: 0, avgTime: 0 };
    }
    const entry = byOperation[m.operation];
    entry.attempts += m.total_attempts;
    entry.accuracy =
      (entry.accuracy * (entry.attempts - m.total_attempts) +
        m.accuracy * m.total_attempts) /
      entry.attempts;
    entry.avgTime =
      (entry.avgTime * (entry.attempts - m.total_attempts) +
        m.avg_response_time_ms * m.total_attempts) /
      entry.attempts;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Performance by Operation</h2>
      <div className="space-y-3">
        {Object.entries(byOperation).map(([op, data]) => (
          <div key={op} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">
                {OPERATION_LABELS[op] || op}
              </span>
              <span className="text-gray-500">
                {Math.round(data.accuracy)}% · {data.attempts} problems ·{" "}
                {(data.avgTime / 1000).toFixed(1)}s avg
              </span>
            </div>
            {/* Bar */}
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  data.accuracy >= 80
                    ? "bg-primary"
                    : data.accuracy >= 50
                      ? "bg-accent"
                      : "bg-red-500"
                }`}
                style={{ width: `${Math.max(2, Math.round(data.accuracy))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
