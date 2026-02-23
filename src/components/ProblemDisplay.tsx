"use client";

// Displays the current math problem and handles user input.
// Shows immediate feedback (correct/incorrect) after each answer.
import { useState, useRef, useEffect } from "react";
import type { Problem } from "@/lib/types";

interface ProblemDisplayProps {
  problem: Problem;
  onAnswer: (userAnswer: number, responseTimeMs: number) => void;
  totalAnswered: number;
  totalCorrect: number;
}

export default function ProblemDisplay({
  problem,
  onAnswer,
  totalAnswered,
  totalCorrect,
}: ProblemDisplayProps) {
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    correctAnswer: number;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef(Date.now());

  // Focus the input and reset timer when a new problem appears
  useEffect(() => {
    setInput("");
    setFeedback(null);
    startTimeRef.current = Date.now();
    // Delay focus to ensure the input is enabled and rendered after feedback clears
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

    // Show feedback briefly, then move to next problem
    setFeedback({ correct: isCorrect, correctAnswer: problem.correctAnswer });

    setTimeout(() => {
      onAnswer(userAnswer, responseTimeMs);
    }, 1000); // Show feedback for 1 second
  };

  const accuracy =
    totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  return (
    <div className="max-w-lg mx-auto space-y-8">
      {/* Session stats bar */}
      <div className="flex justify-between text-sm text-gray-500">
        <span>Answered: {totalAnswered}</span>
        <span>
          Correct: {totalCorrect}/{totalAnswered} ({accuracy}%)
        </span>
      </div>

      {/* The math problem */}
      <div className="text-center">
        <p className="text-5xl font-bold tracking-wide py-8">
          {problem.displayText}
        </p>
      </div>

      {/* Answer input */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          ref={inputRef}
          type="number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Your answer"
          disabled={!!feedback}
          className="w-full text-center text-2xl px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          autoComplete="off"
        />
        {!feedback && (
          <button
            type="submit"
            className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
          >
            Submit (Enter)
          </button>
        )}
      </form>

      {/* Feedback */}
      {feedback && (
        <div
          className={`text-center p-4 rounded-lg text-lg font-semibold ${
            feedback.correct
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {feedback.correct
            ? "Correct!"
            : `Incorrect — the answer is ${feedback.correctAnswer}`}
        </div>
      )}
    </div>
  );
}
