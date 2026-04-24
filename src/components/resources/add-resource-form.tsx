"use client";

import { useActionState, useRef, useEffect } from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createResourceAction,
  type ResourceActionState,
} from "@/lib/actions/resources";

const initialState: ResourceActionState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Uploading..." : "Add resource"}
    </Button>
  );
}

interface Props {
  courseId?: string | null;
  lessonId?: string | null;
  moduleId?: string | null;
}

export function AddResourceForm({ courseId, lessonId, moduleId }: Props) {
  const [state, action] = useActionState(createResourceAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      {courseId && <input type="hidden" name="course_id" value={courseId} />}
      {lessonId && <input type="hidden" name="lesson_id" value={lessonId} />}
      {moduleId && <input type="hidden" name="module_id" value={moduleId} />}

      {state.status === "error" && (
        <Alert variant="error">{state.message}</Alert>
      )}
      {state.status === "success" && (
        <Alert variant="success">{state.message}</Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="resource-title">
            Title <span className="text-red-600">*</span>
          </Label>
          <Input id="resource-title" name="title" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="resource_type">Type</Label>
          <select
            id="resource_type"
            name="resource_type"
            defaultValue="pdf"
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <option value="pdf">PDF</option>
            <option value="doc">Doc</option>
            <option value="sheet">Spreadsheet</option>
            <option value="slide">Slides</option>
            <option value="zip">Zip</option>
            <option value="link">Link</option>
            <option value="template">Template</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="resource-description">Description</Label>
        <Textarea id="resource-description" name="description" rows={2} />
      </div>

      <fieldset className="space-y-3 rounded-md border border-black/10 p-4 dark:border-white/10">
        <legend className="px-1 text-sm font-medium">Source</legend>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Upload a file or paste an external URL — at least one is required.
        </p>

        <div className="space-y-2">
          <Label htmlFor="resource-file">Upload file</Label>
          <input
            id="resource-file"
            name="file"
            type="file"
            className="block w-full text-sm text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-900 hover:file:bg-zinc-200 dark:text-zinc-300 dark:file:bg-zinc-800 dark:file:text-zinc-100 dark:hover:file:bg-zinc-700"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="external_url">External URL</Label>
          <Input
            id="external_url"
            name="external_url"
            type="url"
            placeholder="https://..."
          />
        </div>
      </fieldset>

      <fieldset className="space-y-2 rounded-md border border-black/10 p-4 dark:border-white/10">
        <legend className="px-1 text-sm font-medium">Settings</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_downloadable"
            defaultChecked
            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
          />
          <span>Allow download (vs. open-in-browser only)</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_public"
            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
          />
          <span>Public — visible without enrolment</span>
        </label>
      </fieldset>

      <SubmitButton />
    </form>
  );
}
