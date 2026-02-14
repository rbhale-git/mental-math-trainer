// ============================================================
// Type definitions for the Mental Math Training App
// ============================================================

// The five math operations users can practice
export type Operation = "add" | "subtract" | "multiply" | "divide" | "percentage";

// Difficulty levels — controls the range of numbers generated
export type Difficulty = "easy" | "medium" | "hard" | "expert";

// A single math problem
export interface Problem {
  operation: Operation;
  difficulty: Difficulty;
  operand1: number;
  operand2: number;
  correctAnswer: number;
  // How the problem is displayed to the user (e.g., "25 + 13")
  displayText: string;
}

// A problem record after the user answers (saved to the database)
export interface ProblemRecord {
  id: string;
  user_id: string;
  operation: Operation;
  difficulty: Difficulty;
  operand1: number;
  operand2: number;
  correct_answer: number;
  user_answer: number | null;
  is_correct: boolean;
  response_time_ms: number;
  created_at: string;
}

// A practice session (groups multiple problems together)
export interface Session {
  id: string;
  user_id: string;
  mode: "unlimited" | "timed";
  operations: Operation[];
  difficulty: Difficulty;
  total_problems: number;
  correct_count: number;
  avg_response_time_ms: number;
  started_at: string;
  ended_at: string | null;
}

// Aggregated stats per operation+difficulty combo
export interface PerformanceMetric {
  id: string;
  user_id: string;
  operation: Operation;
  difficulty: Difficulty;
  total_attempts: number;
  correct_attempts: number;
  accuracy: number;
  avg_response_time_ms: number;
  last_practiced: string;
}

// Shape of the practice page's local state
export interface PracticeState {
  // Config
  selectedOperations: Operation[];
  difficulty: Difficulty;
  // Session tracking
  isActive: boolean;
  currentProblem: Problem | null;
  problemStartTime: number | null;
  totalAnswered: number;
  totalCorrect: number;
  sessionId: string | null;
}
