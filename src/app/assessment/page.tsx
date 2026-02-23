"use client";

// Assessment page - adaptive test that determines per-operation skill levels.
// Three phases: intro -> testing -> results.
import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { generateProblem } from "@/lib/problems";
import {
  createAssessmentState,
  getNextQuestion,
  processAnswer,
  computeOverallRating,
  getTotalCorrect,
  TOTAL_QUESTIONS,
} from "@/lib/assessment";
import ProblemDisplay from "@/components/ProblemDisplay";
import AssessmentResults from "@/components/AssessmentResults";
import type { AssessmentState, AssessmentResult, Problem } from "@/lib/types";

type Phase = "intro" | "testing" | "results";

export default function AssessmentPage() {
  const { user } = useAuth();
  const [guestParamEnabled, setGuestParamEnabled] = useState(false);
  const isGuestMode = guestParamEnabled && !user;

  useEffect(() => {
    setGuestParamEnabled(
      new URLSearchParams(window.location.search).get("guest") === "1"
    );
  }, []);

  const [phase, setPhase] = useState<Phase>("intro");
  const [assessmentState, setAssessmentState] =
    useState<AssessmentState | null>(null);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const startAssessment = useCallback(() => {
    const state = createAssessmentState();
    setAssessmentState(state);

    const next = getNextQuestion(state);
    if (next) {
      setCurrentProblem(generateProblem([next.operation], next.difficulty));
    }
    setPhase("testing");
  }, []);

  const handleAnswer = useCallback(
    async (userAnswer: number, _responseTimeMs: number) => {
      if (!assessmentState || !currentProblem) return;
      if (!user && !isGuestMode) return;

      const isCorrect = userAnswer === currentProblem.correctAnswer;
      const newState = processAnswer(assessmentState, isCorrect);
      setAssessmentState(newState);

      if (newState.isComplete) {
        const overallRating = computeOverallRating(newState.operationProgress);
        const totalCorrect = getTotalCorrect(newState.operationProgress);

        if (user && !isGuestMode) {
          const supabase = createClient();
          const { data } = await supabase
            .from("assessments")
            .insert({
              user_id: user.id,
              add_level: newState.operationProgress.add.currentDifficulty,
              subtract_level:
                newState.operationProgress.subtract.currentDifficulty,
              multiply_level:
                newState.operationProgress.multiply.currentDifficulty,
              divide_level: newState.operationProgress.divide.currentDifficulty,
              percentage_level:
                newState.operationProgress.percentage.currentDifficulty,
              overall_rating: overallRating,
              total_questions: TOTAL_QUESTIONS,
              total_correct: totalCorrect,
            })
            .select()
            .single();

          setResult(data as AssessmentResult);
        } else {
          setResult({
            id: `guest-${Date.now()}`,
            user_id: "guest",
            add_level: newState.operationProgress.add.currentDifficulty,
            subtract_level: newState.operationProgress.subtract.currentDifficulty,
            multiply_level: newState.operationProgress.multiply.currentDifficulty,
            divide_level: newState.operationProgress.divide.currentDifficulty,
            percentage_level:
              newState.operationProgress.percentage.currentDifficulty,
            overall_rating: overallRating,
            total_questions: TOTAL_QUESTIONS,
            total_correct: totalCorrect,
            completed_at: new Date().toISOString(),
          });
        }

        setPhase("results");
      } else {
        const next = getNextQuestion(newState);
        if (next) {
          setCurrentProblem(generateProblem([next.operation], next.difficulty));
        }
      }
    },
    [assessmentState, currentProblem, user, isGuestMode]
  );

  // Intro phase
  if (phase === "intro") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-6">
        <h1 className="text-3xl font-bold">Skill Assessment</h1>
        <p className="text-gray-600 text-lg">
          Answer {TOTAL_QUESTIONS} adaptive questions across all 5 operations to
          determine your skill level. The difficulty adjusts based on your
          answers.
        </p>
        <div className="text-sm text-gray-500 space-y-1">
          <p>Addition, Subtraction, Multiplication, Division, Percentages</p>
          <p>~2-3 minutes to complete</p>
        </div>
        {isGuestMode && (
          <p className="text-sm text-olive">Guest mode is active. Results will not be saved.</p>
        )}
        <button
          onClick={startAssessment}
          className="px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors text-lg"
        >
          Begin Assessment
        </button>
      </div>
    );
  }

  // Testing phase
  if (phase === "testing" && assessmentState && currentProblem) {
    const answered = assessmentState.currentIndex;
    const totalCorrect = getTotalCorrect(assessmentState.operationProgress);
    const progressPercent = Math.round((answered / TOTAL_QUESTIONS) * 100);

    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-gray-500">
            <span>
              Question {answered + 1} of {TOTAL_QUESTIONS}
            </span>
            <span>{progressPercent}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Operation badge */}
        <div className="text-center">
          <span className="inline-block px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full capitalize">
            {currentProblem.operation === "add"
              ? "Addition"
              : currentProblem.operation === "subtract"
                ? "Subtraction"
                : currentProblem.operation === "multiply"
                  ? "Multiplication"
                  : currentProblem.operation === "divide"
                    ? "Division"
                    : "Percentage"}
            {" - "}
            {currentProblem.difficulty}
          </span>
        </div>

        <ProblemDisplay
          problem={currentProblem}
          onAnswer={handleAnswer}
          totalAnswered={answered}
          totalCorrect={totalCorrect}
        />
      </div>
    );
  }

  // Results phase
  if (phase === "results" && result) {
    return <AssessmentResults result={result} isGuestMode={isGuestMode} />;
  }

  return null;
}
