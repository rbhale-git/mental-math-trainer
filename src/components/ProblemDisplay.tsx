"use client";

// Displays the current math problem and handles user input.
// Shows immediate feedback after each submission.
import { useState, useRef, useEffect } from "react";
import type { Problem } from "@/lib/types";

interface ProblemDisplayProps {
  problem: Problem;
  onAnswer: (userAnswer: number, responseTimeMs: number) => void;
  totalAnswered: number;
  totalCorrect: number;
  streak: number;
}

function StatIcon({
  type,
}: {
  type: "answered" | "correct" | "accuracy" | "streak";
}) {
  if (type === "answered") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M6 3h9l3 3v15H6z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 9h6M9 13h6M9 17h4" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "correct") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === "streak") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M13.8 2.3c.5 2.7-.8 4.6-2.3 6.2-1.4 1.5-2.9 3-2.9 5.2 0 1.9 1.5 3.5 3.4 3.5 2.3 0 4-1.8 4-4.3 0-1.6-.8-2.9-1.8-4.1 2.6.7 4.5 3.1 4.5 6.1 0 4-2.9 6.9-6.8 6.9-3.6 0-6.4-2.6-6.4-6.2 0-3.6 2.3-5.6 4.2-7.5 1.4-1.4 2.6-2.7 3-5.8z" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FeedbackIcon({ correct }: { correct: boolean }) {
  if (correct) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="m8 8 8 8M16 8l-8 8" strokeLinecap="round" />
    </svg>
  );
}

function operationLabel(operation: Problem["operation"]): string {
  if (operation === "add") return "Addition";
  if (operation === "subtract") return "Subtraction";
  if (operation === "multiply") return "Multiplication";
  if (operation === "divide") return "Division";
  return "Percentage";
}

export default function ProblemDisplay({
  problem,
  onAnswer,
  totalAnswered,
  totalCorrect,
  streak,
}: ProblemDisplayProps) {
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    correctAnswer: number;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    setInput("");
    setFeedback(null);
    startTimeRef.current = Date.now();

    const timer = setTimeout(() => inputRef.current?.focus(), 10);
    return () => clearTimeout(timer);
  }, [problem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || feedback) return;

    const userAnswer = parseFloat(input);
    if (isNaN(userAnswer)) return;

    const responseTimeMs = Date.now() - startTimeRef.current;
    const isCorrect = userAnswer === problem.correctAnswer;

    setFeedback({ correct: isCorrect, correctAnswer: problem.correctAnswer });

    setTimeout(() => {
      onAnswer(userAnswer, responseTimeMs);
    }, 1000);
  };

  const accuracy =
    totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2 text-gray-500">
            <StatIcon type="answered" />
            <p className="text-xs font-semibold uppercase tracking-wide">Answered</p>
          </div>
          <p className="mt-1 text-xl font-bold text-gray-900">{totalAnswered}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2 text-gray-500">
            <StatIcon type="correct" />
            <p className="text-xs font-semibold uppercase tracking-wide">Correct</p>
          </div>
          <p className="mt-1 text-xl font-bold text-gray-900">{totalCorrect}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2 text-gray-500">
            <StatIcon type="accuracy" />
            <p className="text-xs font-semibold uppercase tracking-wide">Accuracy</p>
          </div>
          <p className="mt-1 text-xl font-bold text-gray-900">{accuracy}%</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2 text-gray-500">
            <StatIcon type="streak" />
            <p className="text-xs font-semibold uppercase tracking-wide">Streak</p>
          </div>
          <p className="mt-1 text-xl font-bold text-gray-900">{streak}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-white to-primary/5 px-5 py-8 text-center shadow-sm md:px-8">
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full bg-primary/12 px-3 py-1 text-xs font-semibold text-primary">
            {operationLabel(problem.operation)}
          </span>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold capitalize text-gray-600">
            {problem.difficulty}
          </span>
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
          Solve
        </p>
        <p className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
          {problem.displayText}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="rounded-xl border border-gray-300 bg-white p-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            enterKeyHint="done"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your answer"
            disabled={!!feedback}
            className="w-full border-0 bg-transparent px-2 py-2 text-center text-2xl font-semibold text-gray-900 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>

        {!feedback && (
          <button
            type="submit"
            className="w-full rounded-xl bg-primary py-3 text-base font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Submit Answer
          </button>
        )}

        {!feedback && (
          <p className="text-center text-xs text-gray-500">Press Enter to submit</p>
        )}
      </form>

      {feedback && (
        <div
          className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-center text-base font-semibold ${
            feedback.correct
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <FeedbackIcon correct={feedback.correct} />
          <span>
            {feedback.correct
              ? "Correct. Great work."
              : `Not quite. Correct answer: ${feedback.correctAnswer}`}
          </span>
        </div>
      )}
    </div>
  );
}
