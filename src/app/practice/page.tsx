"use client";

// Practice page - users configure a session, then solve generated problems.
// Signed-in users are saved to Supabase; guest mode runs locally only.
import Link from "next/link";
import { useState, useCallback, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { generateProblem } from "@/lib/problems";
import PracticeConfig from "@/components/PracticeConfig";
import ProblemDisplay from "@/components/ProblemDisplay";
import type {
  Difficulty,
  Operation,
  PracticeMode,
  Problem,
} from "@/lib/types";

type SessionEndReason = "manual" | "time_up" | "out_of_lives";

interface SessionSummary {
  mode: PracticeMode;
  reason: SessionEndReason;
  totalAnswered: number;
  totalCorrect: number;
  avgResponseTimeMs: number;
  bestStreak: number;
}

const DEFAULT_TIMED_DURATION_SEC = 120;
const DEFAULT_LIVES_COUNT = 3;

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function modeLabel(mode: PracticeMode): string {
  if (mode === "timed") return "Timed";
  if (mode === "lives") return "Lives";
  return "Unlimited";
}

function HeaderIcon({
  type,
}: {
  type: "mode" | "clock" | "heart" | "open" | "streak";
}) {
  if (type === "clock") {
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

  if (type === "heart") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M12 21s-6.7-4.3-9.2-8.3C.8 9.5 2.1 6 5.5 5.1c2-.5 4 .3 5.2 2 1.2-1.7 3.2-2.5 5.2-2 3.4.9 4.7 4.4 2.7 7.6C18.7 16.7 12 21 12 21z" />
      </svg>
    );
  }

  if (type === "open") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M4 12h16" strokeLinecap="round" />
        <path d="M8 8l-4 4 4 4" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M16 8l4 4-4 4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
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
      <path d="M9 12h6M12 9v6" strokeLinecap="round" />
    </svg>
  );
}

function summaryMessage(summary: SessionSummary): string {
  const accuracy =
    summary.totalAnswered > 0
      ? Math.round((summary.totalCorrect / summary.totalAnswered) * 100)
      : 0;

  if (summary.reason === "time_up") {
    return `Time is up. You solved ${summary.totalCorrect} of ${summary.totalAnswered} correctly (${accuracy}%). Best streak: ${summary.bestStreak}.`;
  }
  if (summary.reason === "out_of_lives") {
    return `No lives remaining. You solved ${summary.totalCorrect} of ${summary.totalAnswered} correctly (${accuracy}%). Best streak: ${summary.bestStreak}.`;
  }
  return `Session ended. You solved ${summary.totalCorrect} of ${summary.totalAnswered} correctly (${accuracy}%). Best streak: ${summary.bestStreak}.`;
}

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
  const [mode, setMode] = useState<PracticeMode>("unlimited");
  const [timedDurationSec, setTimedDurationSec] = useState(
    DEFAULT_TIMED_DURATION_SEC
  );
  const [livesCount, setLivesCount] = useState(DEFAULT_LIVES_COUNT);

  // Practice session state
  const [isActive, setIsActive] = useState(false);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalResponseTime, setTotalResponseTime] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeRemainingSec, setTimeRemainingSec] = useState(
    DEFAULT_TIMED_DURATION_SEC
  );
  const [livesRemaining, setLivesRemaining] = useState(DEFAULT_LIVES_COUNT);
  const [lastSummary, setLastSummary] = useState<SessionSummary | null>(null);

  const endingSessionRef = useRef(false);

  const finishSession = useCallback(
    async (
      reason: SessionEndReason,
      finalTotals?: {
        answered: number;
        correct: number;
        responseTime: number;
        bestStreak: number;
      }
    ) => {
      if (endingSessionRef.current) return;
      endingSessionRef.current = true;

      try {
        const answered = finalTotals?.answered ?? totalAnswered;
        const correct = finalTotals?.correct ?? totalCorrect;
        const responseTime = finalTotals?.responseTime ?? totalResponseTime;
        const peakStreak = finalTotals?.bestStreak ?? bestStreak;

        if (!isGuestMode && sessionId) {
          const supabase = createClient();
          await supabase
            .from("sessions")
            .update({
              total_problems: answered,
              correct_count: correct,
              avg_response_time_ms:
                answered > 0 ? Math.round(responseTime / answered) : 0,
              ended_at: new Date().toISOString(),
            })
            .eq("id", sessionId);
        }

        setLastSummary({
          mode,
          reason,
          totalAnswered: answered,
          totalCorrect: correct,
          avgResponseTimeMs:
            answered > 0 ? Math.round(responseTime / answered) : 0,
          bestStreak: peakStreak,
        });

        setIsActive(false);
        setCurrentProblem(null);
        setSessionId(null);
        setCurrentStreak(0);
        setTimeRemainingSec(timedDurationSec);
        setLivesRemaining(livesCount);
      } finally {
        endingSessionRef.current = false;
      }
    },
    [
      isGuestMode,
      sessionId,
      totalAnswered,
      totalCorrect,
      totalResponseTime,
      bestStreak,
      mode,
      timedDurationSec,
      livesCount,
    ]
  );

  // Start a new practice session
  const handleStart = useCallback(async () => {
    if (!user && !isGuestMode) return;

    endingSessionRef.current = false;

    if (user && !isGuestMode) {
      const supabase = createClient();

      const { data: session } = await supabase
        .from("sessions")
        .insert({
          user_id: user.id,
          mode,
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
    setCurrentStreak(0);
    setBestStreak(0);
    setTimeRemainingSec(timedDurationSec);
    setLivesRemaining(livesCount);
    setLastSummary(null);
    setCurrentProblem(generateProblem(selectedOperations, difficulty));
    setIsActive(true);
  }, [
    user,
    isGuestMode,
    mode,
    selectedOperations,
    difficulty,
    timedDurationSec,
    livesCount,
  ]);

  // Timed mode countdown tick
  useEffect(() => {
    if (!isActive || mode !== "timed" || timeRemainingSec <= 0) return;

    const timeoutId = window.setTimeout(() => {
      setTimeRemainingSec((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [isActive, mode, timeRemainingSec]);

  // End timed sessions when countdown reaches zero
  useEffect(() => {
    if (!isActive || mode !== "timed" || timeRemainingSec > 0) return;
    void finishSession("time_up");
  }, [isActive, mode, timeRemainingSec, finishSession]);

  // Handle when the user answers a problem
  const handleAnswer = useCallback(
    async (userAnswer: number, responseTimeMs: number) => {
      if (!currentProblem || endingSessionRef.current) return;
      if (!user && !isGuestMode) return;

      const isCorrect = userAnswer === currentProblem.correctAnswer;
      const newTotalAnswered = totalAnswered + 1;
      const newTotalCorrect = totalCorrect + (isCorrect ? 1 : 0);
      const newTotalResponseTime = totalResponseTime + responseTimeMs;
      const newCurrentStreak = isCorrect ? currentStreak + 1 : 0;
      const newBestStreak = Math.max(bestStreak, newCurrentStreak);

      setTotalAnswered(newTotalAnswered);
      setTotalCorrect(newTotalCorrect);
      setTotalResponseTime(newTotalResponseTime);
      setCurrentStreak(newCurrentStreak);
      setBestStreak(newBestStreak);

      let nextLives = livesRemaining;
      if (mode === "lives" && !isCorrect) {
        nextLives = Math.max(livesRemaining - 1, 0);
        setLivesRemaining(nextLives);
      }

      if (user && !isGuestMode) {
        const supabase = createClient();

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

      if (mode === "lives" && nextLives <= 0) {
        await finishSession("out_of_lives", {
          answered: newTotalAnswered,
          correct: newTotalCorrect,
          responseTime: newTotalResponseTime,
          bestStreak: newBestStreak,
        });
        return;
      }

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
      currentStreak,
      bestStreak,
      selectedOperations,
      difficulty,
      mode,
      livesRemaining,
      finishSession,
    ]
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-10">
      {!isActive ? (
        <div className="space-y-6">
          <header className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
              Practice Session Setup
            </h1>
            <p className="text-sm text-gray-600 md:text-base">
              Choose operations, difficulty, and game mode, then start a
              focused training session.
            </p>
          </header>

          {isGuestMode && (
            <div className="rounded-lg border border-accent/40 bg-accent/15 p-3 text-sm text-olive">
              Guest mode is active. Your progress will not be saved.
            </div>
          )}

          {lastSummary && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm font-semibold text-primary">
                {modeLabel(lastSummary.mode)} session complete
              </p>
              <p className="mt-1 text-sm text-gray-700">{summaryMessage(lastSummary)}</p>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            <PracticeConfig
              selectedOperations={selectedOperations}
              difficulty={difficulty}
              mode={mode}
              timedDurationSec={timedDurationSec}
              livesCount={livesCount}
              onOperationsChange={setSelectedOperations}
              onDifficultyChange={setDifficulty}
              onModeChange={setMode}
              onTimedDurationChange={setTimedDurationSec}
              onLivesCountChange={setLivesCount}
              onStart={handleStart}
            />

            <aside className="h-fit rounded-2xl border border-primary/15 bg-white/75 p-5 shadow-sm backdrop-blur-sm">
              <h2 className="text-base font-semibold text-gray-900">
                Session Tips
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li>Use timed mode to train speed under pressure.</li>
                <li>Use lives mode to focus on consistency and accuracy.</li>
                <li>Increase difficulty after you pass 85%+ accuracy.</li>
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
        <div className="space-y-4 rounded-2xl border border-primary/20 bg-white/90 p-5 shadow-sm md:p-7">
          <div className="grid gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm md:grid-cols-[1fr_auto_auto] md:items-center">
            <span className="inline-flex items-center gap-2 font-semibold text-gray-700">
              <HeaderIcon type="mode" />
              Mode: {modeLabel(mode)}
            </span>

            {mode === "timed" && (
              <span className="inline-flex items-center gap-2 rounded-full bg-accent/25 px-3 py-1 font-semibold text-olive">
                <HeaderIcon type="clock" />
                Time Left: {formatTime(timeRemainingSec)}
              </span>
            )}

            {mode === "lives" && (
              <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 font-semibold text-red-700">
                <HeaderIcon type="heart" />
                Lives Left: {livesRemaining}
              </span>
            )}

            {mode === "unlimited" && (
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/12 px-3 py-1 font-semibold text-primary">
                <HeaderIcon type="open" />
                Open Session
              </span>
            )}

            <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 font-semibold text-orange-700">
              <HeaderIcon type="streak" />
              Streak: {currentStreak}
            </span>

            {mode === "lives" && (
              <div className="flex items-center gap-1 md:justify-end">
                {Array.from({ length: livesCount }).map((_, idx) => {
                  const filled = idx < livesRemaining;
                  return (
                    <span
                      key={idx}
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
                        filled ? "bg-red-100 text-red-600" : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      <HeaderIcon type="heart" />
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <ProblemDisplay
            problem={currentProblem}
            onAnswer={handleAnswer}
            totalAnswered={totalAnswered}
            totalCorrect={totalCorrect}
            streak={currentStreak}
          />

          <button
            onClick={() => void finishSession("manual")}
            className="w-full rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800"
          >
            End Session
          </button>
        </div>
      ) : null}
    </div>
  );
}
