"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createThreadAction,
  type ThreadActionState,
  type ThreadFieldErrors,
} from "@/lib/actions/discussions";

const initialState: ThreadActionState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Posting..." : "Create thread"}
    </Button>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-600 dark:text-red-400">{message}</p>;
}

interface ScopeOption {
  id: string;
  label: string;
}

export function ThreadCreateForm({
  cohorts,
  courses,
}: {
  cohorts: ScopeOption[];
  courses: ScopeOption[];
}) {
  const [state, action] = useActionState(createThreadAction, initialState);
  const fieldErrors: ThreadFieldErrors =
    state.status === "error" ? state.fieldErrors ?? {} : {};

  return (
    <form action={action} className="space-y-5">
      {state.status === "error" && (
        <Alert variant="error">{state.message}</Alert>
      )}

      <fieldset className="space-y-3 rounded-md border border-black/10 p-4 dark:border-white/10">
        <legend className="px-1 text-sm font-medium">
          Scope <span className="text-red-600">*</span>
        </legend>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Pick one — cohort or course.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="cohort_id">Cohort</Label>
            <select
              id="cohort_id"
              name="cohort_id"
              defaultValue=""
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <option value="">— None —</option>
              {cohorts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="course_id">Course</Label>
            <select
              id="course_id"
              name="course_id"
              defaultValue=""
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <option value="">— None —</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <FieldError message={fieldErrors.scope} />
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-red-600">*</span>
        </Label>
        <Input id="title" name="title" required />
        <FieldError message={fieldErrors.title} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Body (optional)</Label>
        <Textarea id="body" name="body" rows={5} />
      </div>

      <SubmitButton />
    </form>
  );
}
