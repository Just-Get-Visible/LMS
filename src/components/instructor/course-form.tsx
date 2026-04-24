"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { TagsInput } from "@/components/instructor/tags-input";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createCourseAction,
  updateCourseAction,
  type CourseActionState,
  type CourseFieldErrors,
} from "@/lib/actions/courses";
import type { Tables } from "@/types";

const initialState: CourseActionState = { status: "idle" };

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

export function CourseCreateForm() {
  const [state, action] = useActionState(createCourseAction, initialState);
  const fieldErrors: CourseFieldErrors =
    state.status === "error" ? state.fieldErrors ?? {} : {};

  return (
    <form action={action} className="space-y-5">
      {state.status === "error" && (
        <Alert variant="error">{state.message}</Alert>
      )}

      <Field label="Title" name="title" required error={fieldErrors.title} />
      <Field
        label="Slug (URL identifier)"
        name="slug"
        placeholder="auto-generated from title"
        error={fieldErrors.slug}
      />
      <Field label="Subtitle" name="subtitle" />

      <div className="space-y-2">
        <Label htmlFor="delivery_type">Delivery type</Label>
        <select
          id="delivery_type"
          name="delivery_type"
          defaultValue="self_paced"
          className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
        >
          <option value="self_paced">Self-paced</option>
          <option value="cohort">Cohort-based</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </div>

      <SubmitButton label="Create course" />
    </form>
  );
}

export function CourseEditForm({ course }: { course: Tables<"courses"> }) {
  const [state, action] = useActionState(updateCourseAction, initialState);
  const fieldErrors: CourseFieldErrors =
    state.status === "error" ? state.fieldErrors ?? {} : {};

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="course_id" value={course.id} />

      {state.status === "error" && (
        <Alert variant="error">{state.message}</Alert>
      )}
      {state.status === "success" && (
        <Alert variant="success">{state.message}</Alert>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Title"
          name="title"
          required
          defaultValue={course.title}
          error={fieldErrors.title}
        />
        <Field
          label="Slug"
          name="slug"
          required
          defaultValue={course.slug}
          error={fieldErrors.slug}
        />
      </div>

      <Field
        label="Subtitle"
        name="subtitle"
        defaultValue={course.subtitle ?? ""}
      />

      <div className="space-y-2">
        <Label htmlFor="short_description">Short description</Label>
        <Textarea
          id="short_description"
          name="short_description"
          rows={2}
          defaultValue={course.short_description ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Long description</Label>
        <Textarea
          id="description"
          name="description"
          rows={6}
          defaultValue={course.description ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags-input">Tags</Label>
        <TagsInput defaultTags={course.tags ?? []} inputId="tags-input" />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="delivery_type">Delivery type</Label>
          <select
            id="delivery_type"
            name="delivery_type"
            defaultValue={course.delivery_type}
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <option value="self_paced">Self-paced</option>
            <option value="cohort">Cohort-based</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        <Field
          label="Difficulty level"
          name="difficulty_level"
          placeholder="beginner / intermediate / advanced"
          defaultValue={course.difficulty_level ?? ""}
        />

        <Field
          label="Duration (hours)"
          name="estimated_duration_hours"
          type="number"
          step="0.5"
          defaultValue={course.estimated_duration_hours?.toString() ?? ""}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <ImageField
          label="Thumbnail"
          urlName="thumbnail_url"
          fileName="thumbnail_file"
          defaultValue={course.thumbnail_url ?? ""}
        />
        <ImageField
          label="Featured image"
          urlName="featured_image_url"
          fileName="featured_image_file"
          defaultValue={course.featured_image_url ?? ""}
        />
      </div>

      <Field
        label="Intro video URL"
        name="intro_video_url"
        type="url"
        defaultValue={course.intro_video_url ?? ""}
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <Field
          label="Price amount"
          name="price_amount"
          type="number"
          step="0.01"
          defaultValue={course.price_amount?.toString() ?? "0"}
        />
        <Field
          label="Currency"
          name="currency_code"
          defaultValue={course.currency_code ?? "GBP"}
        />
        <Field
          label="Language"
          name="language_code"
          defaultValue={course.language_code ?? "en"}
        />
      </div>

      <fieldset className="space-y-3 rounded-md border border-black/10 p-4 dark:border-white/10">
        <legend className="px-1 text-sm font-medium">Settings</legend>
        <Toggle name="is_free" label="Free course" defaultChecked={course.is_free} />
        <Toggle
          name="certificate_enabled"
          label="Issue certificate on completion"
          defaultChecked={course.certificate_enabled}
        />
        <Toggle
          name="allow_discussions"
          label="Allow discussion threads"
          defaultChecked={course.allow_discussions}
        />
        <Toggle
          name="allow_comments"
          label="Allow lesson comments"
          defaultChecked={course.allow_comments}
        />
      </fieldset>

      <SubmitButton label="Save course" />
    </form>
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

function ImageField({
  label,
  urlName,
  fileName,
  defaultValue,
}: {
  label: string;
  urlName: string;
  fileName: string;
  defaultValue: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={urlName}>{label}</Label>
      {defaultValue && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={defaultValue}
          alt=""
          className="h-20 w-32 rounded-md border border-black/10 object-cover dark:border-white/10"
        />
      )}
      <Input
        id={urlName}
        name={urlName}
        type="url"
        placeholder="Paste a URL or upload below"
        defaultValue={defaultValue}
      />
      <input
        id={fileName}
        name={fileName}
        type="file"
        accept="image/*"
        className="block w-full text-sm text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-900 hover:file:bg-zinc-200 dark:text-zinc-300 dark:file:bg-zinc-800 dark:file:text-zinc-100 dark:hover:file:bg-zinc-700"
      />
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Uploading a file overrides the URL.
      </p>
    </div>
  );
}
