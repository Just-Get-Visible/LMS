"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createCohortAction,
  updateCohortAction,
  type CohortActionState,
  type CohortFieldErrors,
} from "@/lib/actions/cohorts";
import type { Tables } from "@/types";

const initialState: CohortActionState = { status: "idle" };

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

export function CohortCreateForm({
  courses,
}: {
  courses: { id: string; title: string }[];
}) {
  const [state, action] = useActionState(createCohortAction, initialState);
  const fieldErrors: CohortFieldErrors =
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
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
        <FieldError message={fieldErrors.course_id} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">
          Cohort name <span className="text-red-600">*</span>
        </Label>
        <Input id="name" name="name" required placeholder="e.g. Spring 2026" />
        <FieldError message={fieldErrors.name} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug (URL identifier)</Label>
        <Input
          id="slug"
          name="slug"
          placeholder="auto-generated from name"
        />
        <FieldError message={fieldErrors.slug} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={3} />
      </div>

      <SubmitButton label="Create cohort" />
    </form>
  );
}

export function CohortEditForm({ cohort }: { cohort: Tables<"cohorts"> }) {
  const [state, action] = useActionState(updateCohortAction, initialState);
  const fieldErrors: CohortFieldErrors =
    state.status === "error" ? state.fieldErrors ?? {} : {};

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="cohort_id" value={cohort.id} />

      {state.status === "error" && (
        <Alert variant="error">{state.message}</Alert>
      )}
      {state.status === "success" && (
        <Alert variant="success">{state.message}</Alert>
      )}

      <Section title="Basics">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Cohort name"
            name="name"
            required
            defaultValue={cohort.name}
            error={fieldErrors.name}
          />
          <Field
            label="Slug"
            name="slug"
            required
            defaultValue={cohort.slug}
            error={fieldErrors.slug}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={cohort.status}
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <option value="draft">Draft</option>
            <option value="open">Open for enrolment</option>
            <option value="closed">Enrolment closed</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={cohort.description ?? ""}
          />
        </div>
      </Section>

      <Section title="Schedule">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Starts at"
            name="starts_at"
            type="datetime-local"
            defaultValue={toDateTimeLocal(cohort.starts_at)}
          />
          <Field
            label="Ends at"
            name="ends_at"
            type="datetime-local"
            defaultValue={toDateTimeLocal(cohort.ends_at)}
          />
          <Field
            label="Enrolment opens at"
            name="enrolment_opens_at"
            type="datetime-local"
            defaultValue={toDateTimeLocal(cohort.enrolment_opens_at)}
          />
          <Field
            label="Enrolment closes at"
            name="enrolment_closes_at"
            type="datetime-local"
            defaultValue={toDateTimeLocal(cohort.enrolment_closes_at)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Timezone"
            name="timezone"
            defaultValue={cohort.timezone ?? "Europe/London"}
            placeholder="Europe/London"
          />
          <Field
            label="Live session frequency"
            name="live_session_frequency"
            defaultValue={cohort.live_session_frequency ?? ""}
            placeholder="weekly / bi-weekly"
          />
        </div>
      </Section>

      <Section title="Capacity & pricing">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Capacity"
            name="capacity"
            type="number"
            min={1}
            defaultValue={cohort.capacity?.toString() ?? ""}
            placeholder="Optional"
          />
          <Field
            label="Price"
            name="price_amount"
            type="number"
            step="0.01"
            min={0}
            defaultValue={cohort.price_amount?.toString() ?? ""}
          />
          <Field
            label="Currency"
            name="currency_code"
            defaultValue={cohort.currency_code ?? "GBP"}
          />
        </div>

        <div className="space-y-2">
          <Toggle
            name="waitlist_enabled"
            label="Allow waitlist"
            defaultChecked={cohort.waitlist_enabled}
          />
          <Toggle
            name="community_enabled"
            label="Community enabled"
            defaultChecked={cohort.community_enabled}
          />
        </div>
      </Section>

      <div className="flex justify-end">
        <SubmitButton label="Save cohort" />
      </div>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-4 rounded-xl border border-black/10 p-5 dark:border-white/10">
      <legend className="px-2 text-sm font-semibold">{title}</legend>
      {children}
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
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

function Toggle({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
      />
      <span>{label}</span>
    </label>
  );
}
