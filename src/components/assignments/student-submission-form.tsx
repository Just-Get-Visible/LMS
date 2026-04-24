"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { SubmissionFileButton } from "@/components/assignments/submission-file-button";
import { SubmissionStatusBadge } from "@/components/assignments/submission-status-badge";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  saveSubmissionAction,
  type SubmissionActionState,
} from "@/lib/actions/submissions";
import type { Tables } from "@/types";

const initialState: SubmissionActionState = { status: "idle" };

function SubmitButton({
  label,
  intent,
  variant = "primary",
}: {
  label: string;
  intent: "draft" | "submit";
  variant?: "primary" | "secondary";
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      name="intent"
      value={intent}
      variant={variant}
      disabled={pending}
    >
      {pending ? "Saving..." : label}
    </Button>
  );
}

interface Props {
  assignment: Tables<"assignments">;
  currentSubmission: Tables<"assignment_submissions"> | null;
}

export function StudentSubmissionForm({
  assignment,
  currentSubmission,
}: Props) {
  const [state, action] = useActionState(saveSubmissionAction, initialState);

  const finalised = !!currentSubmission && currentSubmission.status !== "draft";
  const overdue =
    !!assignment.due_at && new Date(assignment.due_at) < new Date();
  const submitDisabled = overdue && !assignment.allow_late_submissions;

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="assignment_id" value={assignment.id} />

      {state.status === "error" && (
        <Alert variant="error">{state.message}</Alert>
      )}
      {state.status === "success" && (
        <Alert variant={state.submitted ? "success" : "info"}>
          {state.message}
        </Alert>
      )}

      {finalised && currentSubmission && (
        <Alert variant="info">
          You&apos;ve already submitted this assignment (
          <SubmissionStatusBadge status={currentSubmission.status} />
          ).
          {assignment.allow_multiple_submissions
            ? " You can submit again below."
            : " Further changes are disabled."}
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="submission_text">Your submission</Label>
        <Textarea
          id="submission_text"
          name="submission_text"
          rows={8}
          defaultValue={currentSubmission?.submission_text ?? ""}
          disabled={
            finalised && !assignment.allow_multiple_submissions
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">Attach a file (optional)</Label>
        <input
          id="file"
          name="file"
          type="file"
          className="block w-full text-sm text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-900 hover:file:bg-zinc-200 dark:text-zinc-300 dark:file:bg-zinc-800 dark:file:text-zinc-100 dark:hover:file:bg-zinc-700"
          disabled={finalised && !assignment.allow_multiple_submissions}
        />
        {currentSubmission?.storage_path && (
          <div className="pt-1">
            <SubmissionFileButton submissionId={currentSubmission.id} />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(!finalised || assignment.allow_multiple_submissions) && (
          <>
            <SubmitButton
              label={overdue ? "Submit (late)" : "Submit"}
              intent="submit"
              variant="primary"
            />
            <SubmitButton
              label="Save draft"
              intent="draft"
              variant="secondary"
            />
            {submitDisabled && (
              <p className="text-xs text-red-600 dark:text-red-400">
                Submissions are closed for this assignment.
              </p>
            )}
          </>
        )}
      </div>
    </form>
  );
}
