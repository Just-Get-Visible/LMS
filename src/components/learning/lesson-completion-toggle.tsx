"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { markLessonComplete } from "@/lib/actions/progress";

interface Props {
  lessonId: string;
  initialCompleted: boolean;
}

export function LessonCompletionToggle({ lessonId, initialCompleted }: Props) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !completed;
    setError(null);
    setCompleted(next);
    startTransition(async () => {
      const result = await markLessonComplete(lessonId, next);
      if (!result.ok) {
        setCompleted(!next);
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        onClick={toggle}
        variant={completed ? "secondary" : "primary"}
        disabled={isPending}
      >
        <span className="flex items-center gap-2">
          {completed && <CheckIcon />}
          {completed ? "Lesson complete" : "Mark complete"}
        </span>
      </Button>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}
