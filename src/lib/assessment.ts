// ============================================================
// Adaptive Assessment Algorithm
// ============================================================
// Pure TypeScript module — no React or Supabase dependencies.
// Manages the state machine for a 20-question adaptive assessment.

import type { Operation, Difficulty, AssessmentState, OverallRating } from "./types";

const ALL_OPERATIONS: Operation[] = ["add", "subtract", "multiply", "divide", "percentage"];
const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard", "expert"];
const QUESTIONS_PER_OPERATION = 4;

// Map difficulty to a numeric score for averaging
const DIFFICULTY_SCORE: Record<Difficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
  expert: 4,
};

/**
 * Create the initial assessment state.
 * Builds an interleaved question queue so users don't get the same operation 4x in a row.
 */
export function createAssessmentState(): AssessmentState {
  // Build rounds: each round has one question per operation (shuffled)
  const questionQueue: Operation[] = [];
  for (let round = 0; round < QUESTIONS_PER_OPERATION; round++) {
    const shuffled = [...ALL_OPERATIONS].sort(() => Math.random() - 0.5);
    questionQueue.push(...shuffled);
  }

  const operationProgress = {} as AssessmentState["operationProgress"];
  for (const op of ALL_OPERATIONS) {
    operationProgress[op] = {
      currentDifficulty: "easy",
      questionsAnswered: 0,
      correctCount: 0,
    };
  }

  return {
    operationProgress,
    questionQueue,
    currentIndex: 0,
    isComplete: false,
  };
}

/**
 * Get the operation and difficulty for the current question.
 */
export function getNextQuestion(state: AssessmentState): { operation: Operation; difficulty: Difficulty } | null {
  if (state.isComplete || state.currentIndex >= state.questionQueue.length) {
    return null;
  }
  const operation = state.questionQueue[state.currentIndex];
  const difficulty = state.operationProgress[operation].currentDifficulty;
  return { operation, difficulty };
}

/**
 * Process a user's answer and advance the state.
 * Correct → difficulty goes up one level; wrong → goes down one level.
 * Returns a new state object (immutable update).
 */
export function processAnswer(state: AssessmentState, correct: boolean): AssessmentState {
  const operation = state.questionQueue[state.currentIndex];
  const progress = { ...state.operationProgress[operation] };

  progress.questionsAnswered += 1;
  if (correct) progress.correctCount += 1;

  // Adjust difficulty
  const currentIdx = DIFFICULTIES.indexOf(progress.currentDifficulty);
  if (correct && currentIdx < DIFFICULTIES.length - 1) {
    progress.currentDifficulty = DIFFICULTIES[currentIdx + 1];
  } else if (!correct && currentIdx > 0) {
    progress.currentDifficulty = DIFFICULTIES[currentIdx - 1];
  }

  const newIndex = state.currentIndex + 1;
  const isComplete = newIndex >= state.questionQueue.length;

  return {
    ...state,
    operationProgress: {
      ...state.operationProgress,
      [operation]: progress,
    },
    currentIndex: newIndex,
    isComplete,
  };
}

/**
 * Compute the overall rating from the final per-operation difficulty levels.
 * Average of numeric scores: Beginner (1–1.5), Intermediate (1.5–2.5), Advanced (2.5–3.5), Expert (3.5–4).
 */
export function computeOverallRating(
  operationProgress: AssessmentState["operationProgress"]
): OverallRating {
  let total = 0;
  for (const op of ALL_OPERATIONS) {
    total += DIFFICULTY_SCORE[operationProgress[op].currentDifficulty];
  }
  const avg = total / ALL_OPERATIONS.length;

  if (avg >= 3.5) return "Expert";
  if (avg >= 2.5) return "Advanced";
  if (avg >= 1.5) return "Intermediate";
  return "Beginner";
}

/**
 * Get the total number of correct answers across all operations.
 */
export function getTotalCorrect(operationProgress: AssessmentState["operationProgress"]): number {
  let total = 0;
  for (const op of ALL_OPERATIONS) {
    total += operationProgress[op].correctCount;
  }
  return total;
}

export const TOTAL_QUESTIONS = ALL_OPERATIONS.length * QUESTIONS_PER_OPERATION;
