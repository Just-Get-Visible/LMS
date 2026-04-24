"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  submitAttemptAction,
  type SubmitAttemptState,
} from "@/lib/actions/quiz-attempts";
import type { QuestionWithOptions } from "@/lib/data/quizzes";
import type { Tables } from "@/types";

const initialState: SubmitAttemptState = { status: "idle" };

function SubmitButton({ autoSubmitted }: { autoSubmitted: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || autoSubmitted}>
      {pending
        ? autoSubmitted
          ? "Time's up — submitting..."
          : "Submitting..."
        : "Submit quiz"}
    </Button>
  );
}

interface Props {
  quiz: Pick<
    Tables<"quizzes">,
    "id" | "time_limit_minutes"
  >;
  attempt: Pick<Tables<"quiz_attempts">, "id" | "started_at">;
  entries: QuestionWithOptions[];
}

export function QuizTakeForm({ quiz, attempt, entries }: Props) {
  const [state, action] = useActionState(submitAttemptAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const submittedRef = useRef(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  const handleExpire = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setAutoSubmitted(true);
    formRef.current?.requestSubmit();
  }, []);

  function markSubmitted() {
    submittedRef.current = true;
  }

  return (
    <form
      ref={formRef}
      action={action}
      onSubmit={markSubmitted}
      className="space-y-6"
      // Don't enforce client-side `required` on radios when the timer
      // auto-submits — otherwise the browser blocks the submit dialog.
      noValidate={autoSubmitted}
    >
      <input type="hidden" name="attempt_id" value={attempt.id} />
      <input type="hidden" name="quiz_id" value={quiz.id} />

      {quiz.time_limit_minutes != null && (
        <QuizCountdown
          startedAt={attempt.started_at}
          limitMinutes={quiz.time_limit_minutes}
          onExpire={handleExpire}
        />
      )}

      {state.status === "error" && (
        <Alert variant="error">{state.message}</Alert>
      )}

      {entries.map((entry, index) => (
        <QuestionFieldset
          key={entry.question.id}
          entry={entry}
          index={index}
          requireAnswer={!autoSubmitted}
        />
      ))}

      <div className="flex justify-end">
        <SubmitButton autoSubmitted={autoSubmitted} />
      </div>
    </form>
  );
}

function computeRemainingSec(
  startedAt: string,
  limitMinutes: number,
): number {
  const startMs = new Date(startedAt).getTime();
  if (Number.isNaN(startMs)) return limitMinutes * 60;
  const expireAt = startMs + limitMinutes * 60 * 1000;
  return Math.max(0, Math.floor((expireAt - Date.now()) / 1000));
}

function QuizCountdown({
  startedAt,
  limitMinutes,
  onExpire,
}: {
  startedAt: string;
  limitMinutes: number;
  onExpire: () => void;
}) {
  const [remaining, setRemaining] = useState(() =>
    computeRemainingSec(startedAt, limitMinutes),
  );
  const firedRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (remaining <= 0 && !firedRef.current) {
      firedRef.current = true;
      onExpireRef.current();
      return;
    }
    if (remaining <= 0) return;
    const id = setInterval(() => {
      const next = computeRemainingSec(startedAt, limitMinutes);
      setRemaining(next);
      if (next <= 0 && !firedRef.current) {
        firedRef.current = true;
        onExpireRef.current();
        clearInterval(id);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [startedAt, limitMinutes, remaining]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const danger = remaining > 0 && remaining <= 60;
  const expired = remaining <= 0;

  return (
    <div
      role="timer"
      aria-live="off"
      className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm font-medium ${
        expired
          ? "border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
          : danger
            ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
            : "border-black/10 bg-zinc-50 text-zinc-700 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300"
      }`}
    >
      <span>Time remaining</span>
      <span className="font-mono tabular-nums">
        {expired
          ? "00:00"
          : `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`}
      </span>
    </div>
  );
}

function QuestionFieldset({
  entry,
  index,
  requireAnswer,
}: {
  entry: QuestionWithOptions;
  index: number;
  requireAnswer: boolean;
}) {
  const { question, options } = entry;
  const isMulti = question.question_type === "multi_select";
  return (
    <fieldset className="space-y-3 rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
      <legend className="px-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Question {index + 1} · {question.points} pt
        {Number(question.points) === 1 ? "" : "s"}
        {isMulti && " · select all that apply"}
      </legend>
      <p className="font-medium">{question.question_text}</p>
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.id}
            className="flex cursor-pointer items-center gap-3 rounded-md border border-black/10 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-zinc-900"
          >
            <input
              type={isMulti ? "checkbox" : "radio"}
              name={`question_${question.id}`}
              value={option.id}
              // Browser's `required` only meaningful for radios — checkboxes
              // can have any number selected including zero. Server scoring
              // handles 0-selection multi-select as 0 points.
              required={requireAnswer && !isMulti}
              className="h-4 w-4"
            />
            <span>{option.option_text}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
