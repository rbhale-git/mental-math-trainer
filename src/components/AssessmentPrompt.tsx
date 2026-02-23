"use client";

// Dashboard banner prompting new users to take the adaptive assessment.
// Dismissible via localStorage so it doesn't reappear after being skipped.
import { useState, useEffect } from "react";
import Link from "next/link";

const DISMISSED_KEY = "assessment-prompt-dismissed";

export default function AssessmentPrompt() {
  const [dismissed, setDismissed] = useState(true); // default hidden to avoid flash

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISSED_KEY) === "true");
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "true");
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 space-y-3">
      <h2 className="text-lg font-semibold text-olive">
        Find your skill level
      </h2>
      <p className="text-olive/80 text-sm">
        Take a quick 20-question adaptive assessment to determine your skill
        level across all operations. It only takes 2-3 minutes.
      </p>
      <div className="flex items-center gap-3">
        <Link
          href="/assessment"
          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
        >
          Take Assessment
        </Link>
        <button
          onClick={handleDismiss}
          className="text-sm text-primary hover:text-primary-dark transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
