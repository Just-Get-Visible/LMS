"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createModuleAction,
  updateModuleAction,
  type ModuleActionState,
} from "@/lib/actions/modules";
import type { Tables } from "@/types";

const initialState: ModuleActionState = { status: "idle" };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="sm">
      {pending ? "Saving..." : label}
    </Button>
  );
}

export function AddModuleForm({ courseId }: { courseId: string }) {
  const [state, action] = useActionState(createModuleAction, initialState);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="course_id" value={courseId} />

      {state.status === "error" && (
        <Alert variant="error">{state.message}</Alert>
      )}

      <div className="grid gap-3 sm:grid-cols-[2fr_3fr_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="new-module-title">Title</Label>
          <Input
            id="new-module-title"
            name="title"
            required
            placeholder="e.g. Getting started"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-module-description">Description</Label>
          <Input
            id="new-module-description"
            name="description"
            placeholder="Optional"
          />
        </div>
        <SubmitButton label="Add module" />
      </div>
    </form>
  );
}

export function EditModuleForm({
  courseId,
  module,
}: {
  courseId: string;
  module: Tables<"course_modules">;
}) {
  const [state, action] = useActionState(updateModuleAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="course_id" value={courseId} />
      <input type="hidden" name="module_id" value={module.id} />

      {state.status === "error" && (
        <Alert variant="error">{state.message}</Alert>
      )}
      {state.status === "success" && (
        <Alert variant="success">{state.message}</Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor={`module-${module.id}-title`}>Title</Label>
        <Input
          id={`module-${module.id}-title`}
          name="title"
          required
          defaultValue={module.title}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`module-${module.id}-description`}>Description</Label>
        <Textarea
          id={`module-${module.id}-description`}
          name="description"
          rows={2}
          defaultValue={module.description ?? ""}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`module-${module.id}-drip`}>
            Drip days (optional)
          </Label>
          <Input
            id={`module-${module.id}-drip`}
            name="drip_days"
            type="number"
            min={0}
            defaultValue={module.drip_days?.toString() ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`module-${module.id}-duration`}>
            Estimated duration (minutes)
          </Label>
          <Input
            id={`module-${module.id}-duration`}
            name="estimated_duration_minutes"
            type="number"
            min={0}
            defaultValue={
              module.estimated_duration_minutes?.toString() ?? ""
            }
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_published"
          defaultChecked={module.is_published}
          className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
        />
        <span>Published</span>
      </label>

      <SubmitButton label="Save module" />
    </form>
  );
}
