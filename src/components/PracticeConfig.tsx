"use client";

// Configuration panel for practice mode.
// Lets the user pick which operations to practice and the difficulty level.
import type { Operation, Difficulty } from "@/lib/types";

const ALL_OPERATIONS: { value: Operation; label: string }[] = [
  { value: "add", label: "Addition" },
  { value: "subtract", label: "Subtraction" },
  { value: "multiply", label: "Multiplication" },
  { value: "divide", label: "Division" },
  { value: "percentage", label: "Percentage" },
];

const ALL_DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "expert", label: "Expert" },
];

interface PracticeConfigProps {
  selectedOperations: Operation[];
  difficulty: Difficulty;
  onOperationsChange: (ops: Operation[]) => void;
  onDifficultyChange: (d: Difficulty) => void;
  onStart: () => void;
}

export default function PracticeConfig({
  selectedOperations,
  difficulty,
  onOperationsChange,
  onDifficultyChange,
  onStart,
}: PracticeConfigProps) {
  // Toggle an operation on/off
  const toggleOperation = (op: Operation) => {
    if (selectedOperations.includes(op)) {
      // Don't allow deselecting the last one
      if (selectedOperations.length > 1) {
        onOperationsChange(selectedOperations.filter((o) => o !== op));
      }
    } else {
      onOperationsChange([...selectedOperations, op]);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center">Practice Mode</h1>

      {/* Operation selection */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Select Operations</h2>
        <div className="flex flex-wrap gap-2">
          {ALL_OPERATIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => toggleOperation(value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedOperations.includes(value)
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty selection */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Difficulty</h2>
        <div className="flex flex-wrap gap-2">
          {ALL_DIFFICULTIES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onDifficultyChange(value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                difficulty === value
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={onStart}
        className="w-full py-3 bg-accent-dark text-white text-lg font-semibold rounded-lg hover:bg-olive transition-colors"
      >
        Start Practice
      </button>
    </div>
  );
}
