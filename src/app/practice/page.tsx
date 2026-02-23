"use client";

// Practice page - the core of the app.
// Users configure their practice (operations + difficulty), then solve problems.
// Signed-in users are saved to Supabase; guest mode runs locally only.
import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { generateProblem } from "@/lib/problems";
import PracticeConfig from "@/components/PracticeConfig";
import ProblemDisplay from "@/components/ProblemDisplay";
import type { Operation, Difficulty, Problem } from "@/lib/types";

export default function PracticePage() {
  const { user } = useAuth();
  const [guestParamEnabled, setGuestParamEnabled] = useState(false);
  const isGuestMode = guestParamEnabled && !user;

  useEffect(() => {
    setGuestParamEnabled(
      new URLSearchParams(window.location.search).get("guest") === "1"
    );
  }, []);

  // Configuration state
  const [selectedOperations, setSelectedOperations] = useState<Operation[]>([
    "add",
  ]);
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
    if (!user && !isGuestMode) return;

    if (user && !isGuestMode) {
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
    } else {
      setSessionId(null);
    }

    setTotalAnswered(0);
    setTotalCorrect(0);
    setTotalResponseTime(0);
    setCurrentProblem(generateProblem(selectedOperations, difficulty));
    setIsActive(true);
  }, [user, isGuestMode, selectedOperations, difficulty]);

  // Handle when the user answers a problem
  const handleAnswer = useCallback(
    async (userAnswer: number, responseTimeMs: number) => {
      if (!currentProblem) return;
      if (!user && !isGuestMode) return;

      const isCorrect = userAnswer === currentProblem.correctAnswer;
      const newTotalAnswered = totalAnswered + 1;
      const newTotalCorrect = totalCorrect + (isCorrect ? 1 : 0);
      const newTotalResponseTime = totalResponseTime + responseTimeMs;

      // Update local state
      setTotalAnswered(newTotalAnswered);
      setTotalCorrect(newTotalCorrect);
      setTotalResponseTime(newTotalResponseTime);

      if (user && !isGuestMode) {
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
      }

      // Generate the next problem
      setCurrentProblem(generateProblem(selectedOperations, difficulty));
    },
    [
      user,
      isGuestMode,
      currentProblem,
      sessionId,
      totalAnswered,
      totalCorrect,
      totalResponseTime,
      selectedOperations,
      difficulty,
    ]
  );

  // End the current session
  const handleEndSession = useCallback(async () => {
    if (!isGuestMode && sessionId) {
      const supabase = createClient();
      await supabase
        .from("sessions")
        .update({ ended_at: new Date().toISOString() })
        .eq("id", sessionId);
    }
    setIsActive(false);
    setCurrentProblem(null);
    setSessionId(null);
  }, [isGuestMode, sessionId]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-10">
      {!isActive ? (
        // Show configuration panel when not practicing
        <div className="space-y-6">
          <header className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
              Practice Session Setup
            </h1>
            <p className="text-sm text-gray-600 md:text-base">
              Choose operations and difficulty, then start a focused training
              session.
            </p>
          </header>

          {isGuestMode && (
            <div className="rounded-lg border border-accent/40 bg-accent/15 p-3 text-sm text-olive">
              Guest mode is active. Your progress will not be saved.
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            <PracticeConfig
              selectedOperations={selectedOperations}
              difficulty={difficulty}
              onOperationsChange={setSelectedOperations}
              onDifficultyChange={setDifficulty}
              onStart={handleStart}
            />

            <aside className="h-fit rounded-2xl border border-primary/15 bg-white/75 p-5 shadow-sm backdrop-blur-sm">
              <h2 className="text-base font-semibold text-gray-900">
                Session Tips
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li>Start with 1-2 operations for focused repetition.</li>
                <li>Increase difficulty only when accuracy stays high.</li>
                <li>Use assessment mode to benchmark your current level.</li>
              </ul>
              <Link
                href={isGuestMode ? "/assessment?guest=1" : "/assessment"}
                className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-primary/25 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
              >
                Take Skill Assessment
              </Link>
            </aside>
          </div>
        </div>
      ) : currentProblem ? (
        // Show the problem when practicing
        <div className="rounded-2xl border border-primary/20 bg-white/90 p-5 shadow-sm md:p-7">
          <div className="space-y-4">
            <ProblemDisplay
              problem={currentProblem}
              onAnswer={handleAnswer}
              totalAnswered={totalAnswered}
              totalCorrect={totalCorrect}
            />
            <button
              onClick={handleEndSession}
              className="w-full rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800"
            >
              End Session
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
