"use client";

// Practice page — the core of the app.
// Users configure their practice (operations + difficulty), then solve problems.
// Each answer is saved to Supabase in real time.
import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { generateProblem } from "@/lib/problems";
import PracticeConfig from "@/components/PracticeConfig";
import ProblemDisplay from "@/components/ProblemDisplay";
import type { Operation, Difficulty, Problem } from "@/lib/types";

export default function PracticePage() {
  const { user } = useAuth();

  // Configuration state
  const [selectedOperations, setSelectedOperations] = useState<Operation[]>(["add"]);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  // Practice session state
  const [isActive, setIsActive] = useState(false);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalResponseTime, setTotalResponseTime] = useState(0);

  // Start a new practice session
  const handleStart = useCallback(async () => {
    if (!user) return;

    const supabase = createClient();

    // Create a session record in the database
    const { data: session } = await supabase
      .from("sessions")
      .insert({
        user_id: user.id,
        mode: "unlimited",
        operations: selectedOperations,
        difficulty,
        total_problems: 0,
        correct_count: 0,
        avg_response_time_ms: 0,
      })
      .select("id")
      .single();

    setSessionId(session?.id ?? null);
    setTotalAnswered(0);
    setTotalCorrect(0);
    setTotalResponseTime(0);
    setCurrentProblem(generateProblem(selectedOperations, difficulty));
    setIsActive(true);
  }, [user, selectedOperations, difficulty]);

  // Handle when the user answers a problem
  const handleAnswer = useCallback(
    async (userAnswer: number, responseTimeMs: number) => {
      if (!user || !currentProblem) return;

      const isCorrect = userAnswer === currentProblem.correctAnswer;
      const newTotalAnswered = totalAnswered + 1;
      const newTotalCorrect = totalCorrect + (isCorrect ? 1 : 0);
      const newTotalResponseTime = totalResponseTime + responseTimeMs;

      // Update local state
      setTotalAnswered(newTotalAnswered);
      setTotalCorrect(newTotalCorrect);
      setTotalResponseTime(newTotalResponseTime);

      const supabase = createClient();

      // Save the problem result to the database
      await supabase.from("problems").insert({
        user_id: user.id,
        operation: currentProblem.operation,
        difficulty: currentProblem.difficulty,
        operand1: currentProblem.operand1,
        operand2: currentProblem.operand2,
        correct_answer: currentProblem.correctAnswer,
        user_answer: userAnswer,
        is_correct: isCorrect,
        response_time_ms: responseTimeMs,
      });

      // Update the session totals
      if (sessionId) {
        await supabase
          .from("sessions")
          .update({
            total_problems: newTotalAnswered,
            correct_count: newTotalCorrect,
            avg_response_time_ms: Math.round(
              newTotalResponseTime / newTotalAnswered
            ),
          })
          .eq("id", sessionId);
      }

      // Upsert performance metrics for this operation+difficulty combo
      // First, fetch existing metrics to calculate new averages
      const { data: existing } = await supabase
        .from("performance_metrics")
        .select("*")
        .eq("user_id", user.id)
        .eq("operation", currentProblem.operation)
        .eq("difficulty", currentProblem.difficulty)
        .single();

      if (existing) {
        const newTotal = existing.total_attempts + 1;
        const newCorrect = existing.correct_attempts + (isCorrect ? 1 : 0);
        const newAvgTime = Math.round(
          (existing.avg_response_time_ms * existing.total_attempts +
            responseTimeMs) /
            newTotal
        );
        await supabase
          .from("performance_metrics")
          .update({
            total_attempts: newTotal,
            correct_attempts: newCorrect,
            accuracy: Math.round((newCorrect / newTotal) * 100 * 100) / 100,
            avg_response_time_ms: newAvgTime,
            last_practiced: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("performance_metrics").insert({
          user_id: user.id,
          operation: currentProblem.operation,
          difficulty: currentProblem.difficulty,
          total_attempts: 1,
          correct_attempts: isCorrect ? 1 : 0,
          accuracy: isCorrect ? 100 : 0,
          avg_response_time_ms: responseTimeMs,
          last_practiced: new Date().toISOString(),
        });
      }

      // Generate the next problem
      setCurrentProblem(generateProblem(selectedOperations, difficulty));
    },
    [user, currentProblem, sessionId, totalAnswered, totalCorrect, totalResponseTime, selectedOperations, difficulty]
  );

  // End the current session
  const handleEndSession = useCallback(async () => {
    if (sessionId) {
      const supabase = createClient();
      await supabase
        .from("sessions")
        .update({ ended_at: new Date().toISOString() })
        .eq("id", sessionId);
    }
    setIsActive(false);
    setCurrentProblem(null);
    setSessionId(null);
  }, [sessionId]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {!isActive ? (
        // Show configuration panel when not practicing
        <PracticeConfig
          selectedOperations={selectedOperations}
          difficulty={difficulty}
          onOperationsChange={setSelectedOperations}
          onDifficultyChange={setDifficulty}
          onStart={handleStart}
        />
      ) : currentProblem ? (
        // Show the problem when practicing
        <div className="space-y-4">
          <ProblemDisplay
            problem={currentProblem}
            onAnswer={handleAnswer}
            totalAnswered={totalAnswered}
            totalCorrect={totalCorrect}
          />
          <button
            onClick={handleEndSession}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            End Session
          </button>
        </div>
      ) : null}
    </div>
  );
}
