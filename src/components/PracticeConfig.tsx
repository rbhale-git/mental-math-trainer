"use client";

// Configuration panel for practice mode.
// Lets the user pick which operations to practice and the difficulty level.
import type { Difficulty, Operation } from "@/lib/types";

const ALL_OPERATIONS: {
  value: Operation;
  label: string;
  hint: string;
  icon: string;
}[] = [
  { value: "add", label: "Addition", hint: "a + b", icon: "+" },
  { value: "subtract", label: "Subtraction", hint: "a - b", icon: "-" },
  { value: "multiply", label: "Multiplication", hint: "a x b", icon: "x" },
  { value: "divide", label: "Division", hint: "a / b", icon: "/" },
  { value: "percentage", label: "Percentage", hint: "x% of y", icon: "%" },
];

const ALL_DIFFICULTIES: {
  value: Difficulty;
  label: string;
  hint: string;
}[] = [
  { value: "easy", label: "Easy", hint: "Warm up" },
  { value: "medium", label: "Medium", hint: "Balanced" },
  { value: "hard", label: "Hard", hint: "Faster pace" },
  { value: "expert", label: "Expert", hint: "Challenge" },
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
    <section className="rounded-2xl border border-primary/20 bg-white/85 p-6 shadow-sm backdrop-blur-sm md:p-8">
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Practice Mode
        </h1>
        <p className="text-sm text-gray-600">
          Customize your session and start solving mental math problems.
        </p>
      </div>

      <div className="space-y-8">
        {/* Operation selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Select Operations
            </h2>
            <span className="rounded-full bg-primary/12 px-3 py-1 text-xs font-semibold text-primary">
              {selectedOperations.length} selected
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {ALL_OPERATIONS.map(({ value, label, hint, icon }) => {
              const isSelected = selectedOperations.includes(value);

              return (
                <button
                  key={value}
                  onClick={() => toggleOperation(value)}
                  className={`group flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-gray-200 bg-white hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg font-bold ${
                      isSelected
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-700 group-hover:bg-primary/15 group-hover:text-primary"
                    }`}
                    aria-hidden="true"
                  >
                    {icon}
                  </span>

                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-gray-900">
                      {label}
                    </span>
                    <span className="block text-xs text-gray-500">{hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty selection */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Difficulty</h2>
          <div className="grid gap-2 sm:grid-cols-4">
            {ALL_DIFFICULTIES.map(({ value, label, hint }) => {
              const isSelected = difficulty === value;

              return (
                <button
                  key={value}
                  onClick={() => onDifficultyChange(value)}
                  className={`rounded-xl border px-4 py-3 text-center transition-all ${
                    isSelected
                      ? "border-primary bg-primary text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  <span className="block text-sm font-semibold">{label}</span>
                  <span
                    className={`block text-xs ${
                      isSelected ? "text-white/80" : "text-gray-500"
                    }`}
                  >
                    {hint}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={onStart}
        className="mt-8 w-full rounded-xl bg-accent-dark py-3 text-lg font-semibold text-white transition-colors hover:bg-olive"
      >
        Start Practice
      </button>
    </section>
  );
}
