"use client";

// Configuration panel for practice mode.
// Lets the user pick operations, difficulty, and game mode.
import type { Difficulty, Operation, PracticeMode } from "@/lib/types";

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

const MODE_OPTIONS: {
  value: PracticeMode;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    value: "unlimited",
    label: "Unlimited",
    description: "Practice continuously at your own pace.",
    icon: "infinity",
  },
  {
    value: "timed",
    label: "Timed",
    description: "Answer as many as possible before time runs out.",
    icon: "clock",
  },
  {
    value: "lives",
    label: "Lives",
    description: "Stay accurate. Session ends when all lives are gone.",
    icon: "heart",
  },
];

const TIMED_OPTIONS = [60, 120, 180];
const LIVES_OPTIONS = [3, 5, 7];

interface PracticeConfigProps {
  selectedOperations: Operation[];
  difficulty: Difficulty;
  mode: PracticeMode;
  timedDurationSec: number;
  livesCount: number;
  onOperationsChange: (ops: Operation[]) => void;
  onDifficultyChange: (d: Difficulty) => void;
  onModeChange: (mode: PracticeMode) => void;
  onTimedDurationChange: (seconds: number) => void;
  onLivesCountChange: (lives: number) => void;
  onStart: () => void;
}

function ModeIcon({ icon }: { icon: string }) {
  if (icon === "clock") {
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

  if (icon === "heart") {
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
      <path d="M16 8l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PracticeConfig({
  selectedOperations,
  difficulty,
  mode,
  timedDurationSec,
  livesCount,
  onOperationsChange,
  onDifficultyChange,
  onModeChange,
  onTimedDurationChange,
  onLivesCountChange,
  onStart,
}: PracticeConfigProps) {
  const toggleOperation = (op: Operation) => {
    if (selectedOperations.includes(op)) {
      if (selectedOperations.length > 1) {
        onOperationsChange(selectedOperations.filter((o) => o !== op));
      }
    } else {
      onOperationsChange([...selectedOperations, op]);
    }
  };

  const startLabel =
    mode === "timed"
      ? `Start ${Math.floor(timedDurationSec / 60)}-Minute Challenge`
      : mode === "lives"
        ? `Start ${livesCount}-Life Run`
        : "Start Practice";

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
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Game Mode</h2>

          <div className="grid gap-3 md:grid-cols-3">
            {MODE_OPTIONS.map(({ value, label, description, icon }) => {
              const isSelected = mode === value;

              return (
                <button
                  key={value}
                  onClick={() => onModeChange(value)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-gray-200 bg-white hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  <span
                    className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-md ${
                      isSelected
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <ModeIcon icon={icon} />
                  </span>
                  <span className="block text-sm font-semibold text-gray-900">
                    {label}
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">
                    {description}
                  </span>
                </button>
              );
            })}
          </div>

          {mode === "timed" && (
            <div className="rounded-xl border border-primary/15 bg-primary/5 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
                Duration
              </p>
              <div className="flex flex-wrap gap-2">
                {TIMED_OPTIONS.map((seconds) => {
                  const selected = timedDurationSec === seconds;
                  return (
                    <button
                      key={seconds}
                      onClick={() => onTimedDurationChange(seconds)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        selected
                          ? "bg-primary text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {Math.floor(seconds / 60)} min
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {mode === "lives" && (
            <div className="rounded-xl border border-primary/15 bg-primary/5 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
                Starting Lives
              </p>
              <div className="flex flex-wrap gap-2">
                {LIVES_OPTIONS.map((lives) => {
                  const selected = livesCount === lives;
                  return (
                    <button
                      key={lives}
                      onClick={() => onLivesCountChange(lives)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        selected
                          ? "bg-primary text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {lives} lives
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

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

      <button
        onClick={onStart}
        className="mt-8 w-full rounded-xl bg-accent-dark py-3 text-lg font-semibold text-white transition-colors hover:bg-olive"
      >
        {startLabel}
      </button>
    </section>
  );
}
