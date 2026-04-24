"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  updateLessonAction,
  type LessonActionState,
  type LessonFieldErrors,
} from "@/lib/actions/lessons";
import type { Tables } from "@/types";

const initialState: LessonActionState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save lesson"}
    </Button>
  );
}

interface Props {
  lesson: Tables<"lessons">;
  modules: Tables<"course_modules">[];
}

export function LessonForm({ lesson, modules }: Props) {
  const [state, action] = useActionState(updateLessonAction, initialState);
  const fieldErrors: LessonFieldErrors =
    state.status === "error" ? state.fieldErrors ?? {} : {};

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="lesson_id" value={lesson.id} />
      <input type="hidden" name="course_id" value={lesson.course_id} />

      {state.status === "error" && (
        <Alert variant="error">{state.message}</Alert>
      )}
      {state.status === "success" && (
        <Alert variant="success">{state.message}</Alert>
      )}

      <Section title="Basics">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Title"
            name="title"
            required
            defaultValue={lesson.title}
            error={fieldErrors.title}
          />
          <Field
            label="Slug"
            name="slug"
            defaultValue={lesson.slug ?? ""}
            placeholder="optional"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="lesson_type">
              Lesson type <span className="text-red-600">*</span>
            </Label>
            <select
              id="lesson_type"
              name="lesson_type"
              defaultValue={lesson.lesson_type}
              required
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <option value="video">Video</option>
              <option value="text">Text</option>
              <option value="document">Document</option>
              <option value="live_session">Live session</option>
              <option value="quiz">Quiz</option>
              <option value="assignment">Assignment</option>
            </select>
            {fieldErrors.lesson_type && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {fieldErrors.lesson_type}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="module_id">Module</Label>
            <select
              id="module_id"
              name="module_id"
              defaultValue={lesson.module_id ?? ""}
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <option value="">Unassigned</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="summary">Summary</Label>
          <Textarea
            id="summary"
            name="summary"
            rows={2}
            defaultValue={lesson.summary ?? ""}
          />
        </div>
      </Section>

      <Section title="Content">
        <div className="space-y-2">
          <Label htmlFor="content_html">Content (HTML)</Label>
          <Textarea
            id="content_html"
            name="content_html"
            rows={10}
            defaultValue={lesson.content_html ?? ""}
            placeholder="<p>Lesson content...</p>"
            className="font-mono text-xs"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            name="excerpt"
            rows={2}
            defaultValue={lesson.excerpt ?? ""}
          />
        </div>
      </Section>

      <Section title="Video">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Video URL"
            name="video_url"
            type="url"
            defaultValue={lesson.video_url ?? ""}
          />
          <Field
            label="Video duration (seconds)"
            name="video_duration_seconds"
            type="number"
            min={0}
            defaultValue={lesson.video_duration_seconds?.toString() ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="transcript">Transcript</Label>
          <Textarea
            id="transcript"
            name="transcript"
            rows={5}
            defaultValue={lesson.transcript ?? ""}
          />
        </div>
      </Section>

      <Section title="Settings">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Drip days"
            name="drip_days"
            type="number"
            min={0}
            defaultValue={lesson.drip_days?.toString() ?? ""}
          />
          <Field
            label="Estimated duration (minutes)"
            name="estimated_duration_minutes"
            type="number"
            min={0}
            defaultValue={
              lesson.estimated_duration_minutes?.toString() ?? ""
            }
          />
        </div>

        <div className="space-y-2">
          <Toggle
            name="is_published"
            label="Published"
            defaultChecked={lesson.is_published}
          />
          <Toggle
            name="is_preview"
            label="Free preview (visible to non-enrolled users)"
            defaultChecked={lesson.is_preview}
          />
        </div>
      </Section>

      <div className="flex justify-end">
        <SubmitButton />
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
