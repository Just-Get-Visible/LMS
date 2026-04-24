"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createQuizAction,
  updateQuizAction,
  type QuizActionState,
  type QuizFieldErrors,
} from "@/lib/actions/quizzes";
import type { Tables } from "@/types";

const initialState: QuizActionState = { status: "idle" };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : label}
    </Button>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-600 dark:text-red-400">{message}</p>;
}

interface CourseOption {
  id: string;
  label: string;
}

export function QuizCreateForm({ courses }: { courses: CourseOption[] }) {
  const [state, action] = useActionState(createQuizAction, initialState);
  const fieldErrors: QuizFieldErrors =
    state.status === "error" ? state.fieldErrors ?? {} : {};

  return (
    <form action={action} className="space-y-5">
      {state.status === "error" && (
        <Alert variant="error">{state.message}</Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="course_id">
          Course <span className="text-red-600">*</span>
        </Label>
        <select
          id="course_id"
          name="course_id"
          required
          defaultValue=""
          className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
        >
          <option value="" disabled>
            Choose a course
          </option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <FieldError message={fieldErrors.course_id} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-red-600">*</span>
        </Label>
        <Input id="title" name="title" required />
        <FieldError message={fieldErrors.title} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={3} />
      </div>

      <SubmitButton label="Create quiz" />
    </form>
  );
}

export function QuizEditForm({ quiz }: { quiz: Tables<"quizzes"> }) {
  const [state, action] = useActionState(updateQuizAction, initialState);
  const fieldErrors: QuizFieldErrors =
    state.status === "error" ? state.fieldErrors ?? {} : {};

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="quiz_id" value={quiz.id} />

      {state.status === "error" && (
        <Alert variant="error">{state.message}</Alert>
      )}
      {state.status === "success" && (
        <Alert variant="success">{state.message}</Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-red-600">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={quiz.title}
        />
        <FieldError message={fieldErrors.title} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={quiz.description ?? ""}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="time_limit_minutes">Time limit (min)</Label>
          <Input
            id="time_limit_minutes"
            name="time_limit_minutes"
            type="number"
            min={1}
            defaultValue={quiz.time_limit_minutes?.toString() ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pass_percent">Pass percent</Label>
          <Input
            id="pass_percent"
            name="pass_percent"
            type="number"
            min={0}
            max={100}
            step="0.5"
            defaultValue={quiz.pass_percent?.toString() ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="attempts_allowed">Attempts allowed</Label>
          <Input
            id="attempts_allowed"
            name="attempts_allowed"
            type="number"
            min={1}
            placeholder="Unlimited"
            defaultValue={quiz.attempts_allowed?.toString() ?? ""}
          />
        </div>
      </div>

      <fieldset className="space-y-3 rounded-md border border-black/10 p-4 dark:border-white/10">
        <legend className="px-1 text-sm font-medium">Settings</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="randomize_questions"
            defaultChecked={quiz.randomize_questions}
            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
          />
          <span>Randomise question order</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="show_results_immediately"
            defaultChecked={quiz.show_results_immediately}
            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
          />
          <span>Show results immediately after submission</span>
        </label>
      </fieldset>

      <div className="flex justify-end">
        <SubmitButton label="Save quiz" />
      </div>
    </form>
  );
}
