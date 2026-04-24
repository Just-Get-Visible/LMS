"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createAnnouncementAction,
  updateAnnouncementAction,
  type AnnouncementActionState,
  type AnnouncementFieldErrors,
} from "@/lib/actions/announcements";
import type { Tables } from "@/types";

const initialState: AnnouncementActionState = { status: "idle" };

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

interface ScopeOption {
  id: string;
  label: string;
}

export function AnnouncementCreateForm({
  cohorts,
  courses,
}: {
  cohorts: ScopeOption[];
  courses: ScopeOption[];
}) {
  const [state, action] = useActionState(
    createAnnouncementAction,
    initialState,
  );
  const fieldErrors: AnnouncementFieldErrors =
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
        <Label htmlFor="body">
          Body <span className="text-red-600">*</span>
        </Label>
        <Textarea id="body" name="body" rows={8} required />
        <FieldError message={fieldErrors.body} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_published"
          className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
        />
        <span>Publish immediately</span>
      </label>

      <SubmitButton label="Create announcement" />
    </form>
  );
}

export function AnnouncementEditForm({
  announcement,
}: {
  announcement: Tables<"announcements">;
}) {
  const [state, action] = useActionState(
    updateAnnouncementAction,
    initialState,
  );
  const fieldErrors: AnnouncementFieldErrors =
    state.status === "error" ? state.fieldErrors ?? {} : {};

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="announcement_id" value={announcement.id} />

      {state.status === "error" && (
        <Alert variant="error">{state.message}</Alert>
      )}
      {state.status === "success" && (
        <Alert variant="success">{state.message}</Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={announcement.title}
        />
        <FieldError message={fieldErrors.title} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Body</Label>
        <Textarea
          id="body"
          name="body"
          rows={10}
          required
          defaultValue={announcement.body}
        />
        <FieldError message={fieldErrors.body} />
      </div>

      <SubmitButton label="Save announcement" />
    </form>
  );
}
