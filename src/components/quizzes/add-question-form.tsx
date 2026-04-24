"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createQuestionAction,
  type QuestionActionState,
} from "@/lib/actions/quizzes";

const initialState: QuestionActionState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Adding..." : "Add question"}
    </Button>
  );
}

export function AddQuestionForm({ quizId }: { quizId: string }) {
  const [state, action] = useActionState(createQuestionAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <input type="hidden" name="quiz_id" value={quizId} />

      {state.status === "error" && (
        <Alert variant="error">{state.message}</Alert>
      )}

      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_120px_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="new-question-text">Question text</Label>
          <Input
            id="new-question-text"
            name="question_text"
            required
            placeholder="What is..."
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-question-type">Type</Label>
          <select
            id="new-question-type"
            name="question_type"
            defaultValue="multiple_choice"
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <option value="multiple_choice">Single answer</option>
            <option value="multi_select">Multiple answers</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-question-points">Points</Label>
          <Input
            id="new-question-points"
            name="points"
            type="number"
            min={0}
            step="0.5"
            defaultValue="1"
          />
        </div>
        <SubmitButton />
      </div>
    </form>
  );
}
