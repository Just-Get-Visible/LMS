"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createSessionAction,
  updateSessionAction,
  type SessionActionState,
  type SessionFieldErrors,
} from "@/lib/actions/live-sessions";
import type { Tables } from "@/types";

const initialState: SessionActionState = { status: "idle" };

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

export function SessionCreateForm({
  cohorts,
  courses,
}: {
  cohorts: ScopeOption[];
  courses: ScopeOption[];
}) {
  const [state, action] = useActionState(createSessionAction, initialState);
  const fieldErrors: SessionFieldErrors =
    state.status === "error" ? state.fieldErrors ?? {} : {};

  return (
    <form action={action} className="space-y-5">
      {state.status === "error" && (
        <Alert variant="error">{state.message}</Alert>
      )}

      <ScopePicker
        cohorts={cohorts}
        courses={courses}
        error={fieldErrors.scope}
      />

      <SessionFieldsBody fieldErrors={fieldErrors} />

      <SubmitButton label="Create session" />
    </form>
  );
}

export function SessionEditForm({
  session,
}: {
  session: Tables<"live_sessions">;
}) {
  const [state, action] = useActionState(updateSessionAction, initialState);
  const fieldErrors: SessionFieldErrors =
    state.status === "error" ? state.fieldErrors ?? {} : {};

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="session_id" value={session.id} />

      {state.status === "error" && (
        <Alert variant="error">{state.message}</Alert>
      )}
      {state.status === "success" && (
        <Alert variant="success">{state.message}</Alert>
      )}

      <SessionFieldsBody session={session} fieldErrors={fieldErrors} />

      <div className="flex justify-end">
        <SubmitButton label="Save session" />
      </div>
    </form>
  );
}

function SessionFieldsBody({
  session,
  fieldErrors,
}: {
  session?: Tables<"live_sessions">;
  fieldErrors: SessionFieldErrors;
}) {
  return (
    <>
      <Field
        label="Title"
        name="title"
        required
        defaultValue={session?.title}
        error={fieldErrors.title}
      />

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={session?.description ?? ""}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Scheduled start"
          name="scheduled_start_at"
          type="datetime-local"
          required
          defaultValue={toDateTimeLocal(session?.scheduled_start_at)}
          error={fieldErrors.scheduled_start_at}
        />
        <Field
          label="Scheduled end"
          name="scheduled_end_at"
          type="datetime-local"
          required
          defaultValue={toDateTimeLocal(session?.scheduled_end_at)}
          error={fieldErrors.scheduled_end_at}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="provider">Provider</Label>
          <select
            id="provider"
            name="provider"
            defaultValue={session?.provider ?? "zoom"}
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <option value="zoom">Zoom</option>
            <option value="google_meet">Google Meet</option>
            <option value="teams">Microsoft Teams</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <Field
          label="Timezone"
          name="timezone"
          defaultValue={session?.timezone ?? "Europe/London"}
        />
      </div>

      <Field
        label="Join URL"
        name="join_url"
        type="url"
        defaultValue={session?.join_url ?? ""}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="External meeting ID"
          name="external_meeting_id"
          defaultValue={session?.external_meeting_id ?? ""}
        />
        <Field
          label="Replay URL"
          name="replay_url"
          type="url"
          defaultValue={session?.replay_url ?? ""}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Max attendees"
          name="max_attendees"
          type="number"
          min={1}
          defaultValue={session?.max_attendees?.toString() ?? ""}
        />
        <label className="flex items-end gap-2 text-sm">
          <input
            type="checkbox"
            name="is_recorded"
            defaultChecked={session?.is_recorded ?? false}
            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
          />
          <span>Record this session</span>
        </label>
      </div>
    </>
  );
}

function ScopePicker({
  cohorts,
  courses,
  error,
}: {
  cohorts: ScopeOption[];
  courses: ScopeOption[];
  error?: string;
}) {
  return (
    <fieldset className="space-y-3 rounded-md border border-black/10 p-4 dark:border-white/10">
      <legend className="px-1 text-sm font-medium">
        Scope <span className="text-red-600">*</span>
      </legend>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Choose a cohort or a course (not both).
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
      <FieldError message={error} />
    </fieldset>
  );
}

function Field({
  label,
  name,
  required,
  error,
  ...rest
}: {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-600"> *</span>}
      </Label>
      <Input id={name} name={name} required={required} {...rest} />
      <FieldError message={error} />
    </div>
  );
}
