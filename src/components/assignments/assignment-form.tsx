"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createAssignmentAction,
  updateAssignmentAction,
  type AssignmentActionState,
  type AssignmentFieldErrors,
} from "@/lib/actions/assignments";
import type { Tables } from "@/types";

const initialState: AssignmentActionState = { status: "idle" };

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

function toDateTimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

interface ScopeOption {
  id: string;
  label: string;
}

export function AssignmentCreateForm({
  courses,
  cohorts,
}: {
  courses: ScopeOption[];
  cohorts: ScopeOption[];
}) {
  const [state, action] = useActionState(
    createAssignmentAction,
    initialState,
  );
  const fieldErrors: AssignmentFieldErrors =
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
        <Label htmlFor="cohort_id">Cohort (optional)</Label>
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

      <FieldsBody fieldErrors={fieldErrors} />

      <SubmitButton label="Create assignment" />
    </form>
  );
}

export function AssignmentEditForm({
  assignment,
}: {
  assignment: Tables<"assignments">;
}) {
  const [state, action] = useActionState(
    updateAssignmentAction,
    initialState,
  );
  const fieldErrors: AssignmentFieldErrors =
    state.status === "error" ? state.fieldErrors ?? {} : {};

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="assignment_id" value={assignment.id} />

      {state.status === "error" && (
        <Alert variant="error">{state.message}</Alert>
      )}
      {state.status === "success" && (
        <Alert variant="success">{state.message}</Alert>
      )}

      <FieldsBody assignment={assignment} fieldErrors={fieldErrors} />

      <div className="flex justify-end">
        <SubmitButton label="Save assignment" />
      </div>
    </form>
  );
}

function FieldsBody({
  assignment,
  fieldErrors,
}: {
  assignment?: Tables<"assignments">;
  fieldErrors: AssignmentFieldErrors;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-red-600">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={assignment?.title}
        />
        <FieldError message={fieldErrors.title} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">Instructions</Label>
        <Textarea
          id="instructions"
          name="instructions"
          rows={6}
          defaultValue={assignment?.instructions ?? ""}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="due_at">Due date</Label>
          <Input
            id="due_at"
            name="due_at"
            type="datetime-local"
            defaultValue={toDateTimeLocal(assignment?.due_at)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max_score">Max score</Label>
          <Input
            id="max_score"
            name="max_score"
            type="number"
            min={0}
            step="0.5"
            defaultValue={assignment?.max_score?.toString() ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="passing_score">Passing score</Label>
          <Input
            id="passing_score"
            name="passing_score"
            type="number"
            min={0}
            step="0.5"
            defaultValue={assignment?.passing_score?.toString() ?? ""}
          />
        </div>
      </div>

      <fieldset className="space-y-3 rounded-md border border-black/10 p-4 dark:border-white/10">
        <legend className="px-1 text-sm font-medium">Submission rules</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="allow_late_submissions"
            defaultChecked={assignment?.allow_late_submissions ?? false}
            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
          />
          <span>Allow late submissions</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="allow_multiple_submissions"
            defaultChecked={assignment?.allow_multiple_submissions ?? false}
            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
          />
          <span>Allow multiple submissions per student</span>
        </label>
      </fieldset>
    </>
  );
}
