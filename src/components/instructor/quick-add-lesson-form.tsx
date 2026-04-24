"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createLessonAction,
  type LessonActionState,
} from "@/lib/actions/lessons";

const initialState: LessonActionState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Adding..." : "Add lesson"}
    </Button>
  );
}

interface Props {
  courseId: string;
  moduleId: string | null;
}

export function QuickAddLessonForm({ courseId, moduleId }: Props) {
  const [state, action] = useActionState(createLessonAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-col gap-2 sm:flex-row sm:items-start"
    >
      <input type="hidden" name="course_id" value={courseId} />
      {moduleId && (
        <input type="hidden" name="module_id" value={moduleId} />
      )}
      <Input
        name="title"
        placeholder="New lesson title"
        required
        className="flex-1"
      />
      <select
        name="lesson_type"
        defaultValue="text"
        className="flex h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
        aria-label="Lesson type"
      >
        <option value="video">Video</option>
        <option value="text">Text</option>
        <option value="document">Document</option>
        <option value="live_session">Live session</option>
        <option value="quiz">Quiz</option>
        <option value="assignment">Assignment</option>
      </select>
      <SubmitButton />
      {state.status === "error" && (
        <p className="text-xs text-red-600 dark:text-red-400">{state.message}</p>
      )}
    </form>
  );
}
