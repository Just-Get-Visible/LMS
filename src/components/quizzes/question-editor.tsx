"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  addOptionAction,
  deleteOptionAction,
  deleteQuestionAction,
  moveQuestionAction,
  setOptionCorrectAction,
  updateQuestionAction,
  type QuestionActionState,
} from "@/lib/actions/quizzes";
import type { QuestionWithOptions } from "@/lib/data/quizzes";

const initialState: QuestionActionState = { status: "idle" };

interface Props {
  quizId: string;
  entries: QuestionWithOptions[];
}

export function QuestionEditor({ quizId, entries }: Props) {
  if (entries.length === 0) {
    return (
      <p className="rounded-md bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
        No questions yet. Add one below.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {entries.map((entry, index) => (
        <QuestionCard
          key={entry.question.id}
          quizId={quizId}
          entry={entry}
          index={index}
          isFirst={index === 0}
          isLast={index === entries.length - 1}
        />
      ))}
    </ul>
  );
}

function QuestionCard({
  quizId,
  entry,
  index,
  isFirst,
  isLast,
}: {
  quizId: string;
  entry: QuestionWithOptions;
  index: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  const { question, options } = entry;
  const hasCorrect = options.some((o) => o.is_correct);

  return (
    <li className="rounded-xl border border-black/10 bg-white dark:border-white/10 dark:bg-zinc-950">
      <header className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0 space-y-1">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Question {index + 1} · {question.points} pt
            {Number(question.points) === 1 ? "" : "s"}
          </p>
          <p className="font-medium">{question.question_text}</p>
          {!hasCorrect && (
            <p className="text-xs text-amber-700 dark:text-amber-400">
              No correct option marked yet.
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <ReorderButton
            disabled={isFirst}
            action={moveQuestionAction.bind(null, quizId, question.id, "up")}
            label="Move up"
            symbol="↑"
          />
          <ReorderButton
            disabled={isLast}
            action={moveQuestionAction.bind(null, quizId, question.id, "down")}
            label="Move down"
            symbol="↓"
          />
          <form
            action={deleteQuestionAction.bind(null, quizId, question.id)}
          >
            <Button type="submit" size="sm" variant="destructive">
              Delete
            </Button>
          </form>
        </div>
      </header>

      <details className="border-t border-black/10 dark:border-white/10">
        <summary className="cursor-pointer px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300">
          Edit question
        </summary>
        <div className="border-t border-black/10 p-4 dark:border-white/10">
          <EditQuestionForm question={question} />
        </div>
      </details>

      <div className="border-t border-black/10 p-4 dark:border-white/10">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Options ({question.question_type === "multi_select"
            ? "any number correct"
            : "one correct"})
        </h4>
        {options.length === 0 ? (
          <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
            No options yet.
          </p>
        ) : (
          <ul className="mb-3 divide-y divide-black/5 rounded-md border border-black/10 dark:divide-white/5 dark:border-white/10">
            {options.map((option) => {
              const isMulti = question.question_type === "multi_select";
              const showAction = isMulti || !option.is_correct;
              const actionLabel = isMulti
                ? option.is_correct
                  ? "Mark incorrect"
                  : "Mark correct"
                : "Set correct";
              return (
                <li
                  key={option.id}
                  className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    {option.is_correct && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                        Correct
                      </span>
                    )}
                    <span>{option.option_text}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {showAction && (
                      <form
                        action={setOptionCorrectAction.bind(
                          null,
                          quizId,
                          question.id,
                          option.id,
                        )}
                      >
                        <Button type="submit" size="sm" variant="ghost">
                          {actionLabel}
                        </Button>
                      </form>
                    )}
                    <form
                      action={deleteOptionAction.bind(null, quizId, option.id)}
                    >
                      <Button type="submit" size="sm" variant="ghost">
                        Delete
                      </Button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <AddOptionForm questionId={question.id} />
      </div>
    </li>
  );
}

function EditQuestionForm({
  question,
}: {
  question: QuestionWithOptions["question"];
}) {
  const [state, action] = useActionState(updateQuestionAction, initialState);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="question_id" value={question.id} />

      {state.status === "error" && (
        <Alert variant="error">{state.message}</Alert>
      )}
      {state.status === "success" && (
        <Alert variant="success">{state.message}</Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor={`question-${question.id}-text`}>Question text</Label>
        <Textarea
          id={`question-${question.id}-text`}
          name="question_text"
          rows={2}
          required
          defaultValue={question.question_text}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_140px_120px]">
        <div className="space-y-2">
          <Label htmlFor={`question-${question.id}-explanation`}>
            Explanation (shown after submission)
          </Label>
          <Textarea
            id={`question-${question.id}-explanation`}
            name="explanation"
            rows={2}
            defaultValue={question.explanation ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`question-${question.id}-type`}>Type</Label>
          <select
            id={`question-${question.id}-type`}
            name="question_type"
            defaultValue={
              question.question_type === "multi_select"
                ? "multi_select"
                : "multiple_choice"
            }
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <option value="multiple_choice">Single answer</option>
            <option value="multi_select">Multiple answers</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`question-${question.id}-points`}>Points</Label>
          <Input
            id={`question-${question.id}-points`}
            name="points"
            type="number"
            min={0}
            step="0.5"
            defaultValue={question.points.toString()}
          />
        </div>
      </div>

      <SaveQuestionButton />
    </form>
  );
}

function SaveQuestionButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Saving..." : "Save question"}
    </Button>
  );
}

function AddOptionForm({ questionId }: { questionId: string }) {
  const [state, action] = useActionState(addOptionAction, initialState);
  return (
    <form action={action} className="flex gap-2">
      <input type="hidden" name="question_id" value={questionId} />
      <Input
        name="option_text"
        placeholder="New option"
        required
        className="flex-1"
      />
      <AddOptionSubmit />
      {state.status === "error" && (
        <p className="text-xs text-red-600 dark:text-red-400">{state.message}</p>
      )}
    </form>
  );
}

function AddOptionSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" variant="secondary" disabled={pending}>
      {pending ? "Adding..." : "Add option"}
    </Button>
  );
}

function ReorderButton({
  disabled,
  action,
  label,
  symbol,
}: {
  disabled: boolean;
  action: () => void | Promise<void>;
  label: string;
  symbol: string;
}) {
  return (
    <form action={action}>
      <Button
        type="submit"
        size="sm"
        variant="ghost"
        disabled={disabled}
        aria-label={label}
        title={label}
      >
        {symbol}
      </Button>
    </form>
  );
}
