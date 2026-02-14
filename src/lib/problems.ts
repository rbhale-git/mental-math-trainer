// ============================================================
// Problem Generation Engine
// ============================================================
// Pure TypeScript module — no Supabase or React dependencies.
// Generates math problems with clean answers based on operation & difficulty.

import type { Operation, Difficulty, Problem } from "./types";

// ---- Helper: random integer between min and max (inclusive) ----
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ---- Helper: pick a random item from an array ----
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---- Number ranges per difficulty ----
const RANGES: Record<Difficulty, { add: [number, number]; mul: [number, number]; divResult: [number, number]; pctBase: number }> = {
  easy:   { add: [1, 50],      mul: [1, 10],   divResult: [1, 10],   pctBase: 100 },
  medium: { add: [10, 500],    mul: [5, 50],   divResult: [1, 50],   pctBase: 200 },
  hard:   { add: [100, 5000],  mul: [10, 100], divResult: [1, 100],  pctBase: 1000 },
  expert: { add: [1000, 50000], mul: [50, 500], divResult: [1, 500], pctBase: 10000 },
};

// ---- Generators for each operation ----

function generateAddition(difficulty: Difficulty): Problem {
  const [min, max] = RANGES[difficulty].add;
  const a = randInt(min, max);
  const b = randInt(min, max);
  return {
    operation: "add",
    difficulty,
    operand1: a,
    operand2: b,
    correctAnswer: a + b,
    displayText: `${a} + ${b}`,
  };
}

function generateSubtraction(difficulty: Difficulty): Problem {
  const [min, max] = RANGES[difficulty].add;
  // Ensure a >= b so the answer is never negative
  let a = randInt(min, max);
  let b = randInt(min, max);
  if (b > a) [a, b] = [b, a];
  return {
    operation: "subtract",
    difficulty,
    operand1: a,
    operand2: b,
    correctAnswer: a - b,
    displayText: `${a} - ${b}`,
  };
}

function generateMultiplication(difficulty: Difficulty): Problem {
  const [min, max] = RANGES[difficulty].mul;
  const a = randInt(min, max);
  const b = randInt(min, max);
  return {
    operation: "multiply",
    difficulty,
    operand1: a,
    operand2: b,
    correctAnswer: a * b,
    displayText: `${a} × ${b}`,
  };
}

function generateDivision(difficulty: Difficulty): Problem {
  // Generate clean division: pick the answer first, then multiply by divisor
  const [minResult, maxResult] = RANGES[difficulty].divResult;
  const answer = randInt(minResult, maxResult);
  const divisor = randInt(2, 12); // keep divisors manageable
  const dividend = answer * divisor;
  return {
    operation: "divide",
    difficulty,
    operand1: dividend,
    operand2: divisor,
    correctAnswer: answer,
    displayText: `${dividend} ÷ ${divisor}`,
  };
}

function generatePercentage(difficulty: Difficulty): Problem {
  const maxBase = RANGES[difficulty].pctBase;

  // Pick percentages that produce whole-number answers
  // Strategy: pick a percentage, then pick a base that's divisible by (100/gcd)
  let percentage: number;
  if (difficulty === "easy") {
    percentage = pickRandom([10, 25, 50]);
  } else {
    percentage = pickRandom([5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80]);
  }

  // Find a base that gives a whole number: base * percentage must be divisible by 100
  // base must be a multiple of (100 / gcd(percentage, 100))
  const g = gcd(percentage, 100);
  const step = 100 / g;
  const maxMultiple = Math.floor(maxBase / step);
  const multiple = randInt(1, Math.max(1, maxMultiple));
  const base = multiple * step;
  const answer = (base * percentage) / 100;

  return {
    operation: "percentage",
    difficulty,
    operand1: percentage,
    operand2: base,
    correctAnswer: answer,
    displayText: `${percentage}% of ${base}`,
  };
}

// Greatest common divisor (for clean percentage generation)
function gcd(a: number, b: number): number {
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

// ---- Main export: generate a random problem ----

const GENERATORS: Record<Operation, (d: Difficulty) => Problem> = {
  add: generateAddition,
  subtract: generateSubtraction,
  multiply: generateMultiplication,
  divide: generateDivision,
  percentage: generatePercentage,
};

/**
 * Generate a single math problem.
 * @param operations - Which operation(s) to pick from
 * @param difficulty - The difficulty level
 */
export function generateProblem(
  operations: Operation[],
  difficulty: Difficulty
): Problem {
  const operation = pickRandom(operations);
  return GENERATORS[operation](difficulty);
}
