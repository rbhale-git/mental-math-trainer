"use client";

// Displays assessment results: per-operation skill levels, overall rating, and CTAs.
import Link from "next/link";
import type { AssessmentResult, Difficulty } from "@/lib/types";

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: "bg-primary/15 text-primary",
  medium: "bg-accent/20 text-accent-dark",
  hard: "bg-accent-dark/15 text-accent-dark",
  expert: "bg-olive/15 text-olive",
};

const RATING_COLORS: Record<string, string> = {
  Beginner: "bg-primary/15 text-primary border-primary/30",
  Intermediate: "bg-accent/20 text-accent-dark border-accent/40",
  Advanced: "bg-accent-dark/15 text-accent-dark border-accent-dark/30",
  Expert: "bg-olive/15 text-olive border-olive/30",
};

const OPERATION_LABELS: Record<string, string> = {
  add: "Addition",
  subtract: "Subtraction",
  multiply: "Multiplication",
  divide: "Division",
  percentage: "Percentage",
};

interface AssessmentResultsProps {
  result: AssessmentResult;
  isGuestMode?: boolean;
}

export default function AssessmentResults({
  result,
  isGuestMode = false,
}: AssessmentResultsProps) {
  const accuracy = Math.round((result.total_correct / result.total_questions) * 100);
  const practiceHref = isGuestMode ? "/practice?guest=1" : "/practice";
  const secondaryHref = isGuestMode ? "/signup" : "/dashboard";
  const secondaryLabel = isGuestMode ? "Create Account" : "Go to Dashboard";

  const levels: { key: string; level: Difficulty }[] = [
    { key: "add", level: result.add_level },
    { key: "subtract", level: result.subtract_level },
    { key: "multiply", level: result.multiply_level },
    { key: "divide", level: result.divide_level },
    { key: "percentage", level: result.percentage_level },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Assessment Complete</h1>
        <p className="text-gray-500">
          {result.total_correct}/{result.total_questions} correct ({accuracy}%)
        </p>

        {/* Overall rating badge */}
        <div className="flex justify-center">
          <span
            className={`inline-block px-6 py-2 text-lg font-bold rounded-full border-2 ${RATING_COLORS[result.overall_rating] ?? ""}`}
          >
            {result.overall_rating}
          </span>
        </div>
      </div>

      {/* Per-operation skill levels */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Skill Levels by Operation</h2>
        <div className="space-y-3">
          {levels.map(({ key, level }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">
                {OPERATION_LABELS[key]}
              </span>
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${DIFFICULTY_COLORS[level]}`}
              >
                {level}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      {isGuestMode && (
        <p className="text-center text-sm text-gray-500">
          Create an account to save your assessment history and progress.
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={practiceHref}
          className="flex-1 text-center px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
        >
          Start Practicing
        </Link>
        <Link
          href={secondaryHref}
          className="flex-1 text-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
        >
          {secondaryLabel}
        </Link>
      </div>
    </div>
  );
}
