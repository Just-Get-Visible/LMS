"use client";

import { useActionState, useMemo, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";

import { SubmissionFileButton } from "@/components/assignments/submission-file-button";
import { SubmissionStatusBadge } from "@/components/assignments/submission-status-badge";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  bulkSetSubmissionStatusAction,
  reviewSubmissionAction,
  type ReviewActionState,
} from "@/lib/actions/submissions";
import type { SubmissionWithStudent } from "@/lib/data/assignments";
import { formatDateTime } from "@/lib/format";
import type { Tables } from "@/types";

interface Props {
  assignmentId: string;
  submissions: SubmissionWithStudent[];
  maxScore: number | null;
}

export function InstructorSubmissionsList({
  assignmentId,
  submissions,
  maxScore,
}: Props) {
  const allIds = useMemo(
    () => submissions.map((s) => s.submission.id),
    [submissions],
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(),
  );

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds((prev) =>
      prev.size === allIds.length ? new Set() : new Set(allIds),
    );
  }

  if (submissions.length === 0) {
    return (
      <p className="rounded-md bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
        No submissions yet.
      </p>
    );
  }

  const selectedArray = [...selectedIds];

  return (
    <div className="space-y-4">
      <BulkActionBar
        assignmentId={assignmentId}
        selectedIds={selectedArray}
        totalCount={allIds.length}
        onToggleAll={toggleAll}
        onClear={() => setSelectedIds(new Set())}
      />
      <ul className="space-y-3">
        {submissions.map((entry) => (
          <SubmissionEntry
            key={entry.submission.id}
            entry={entry}
            maxScore={maxScore}
            selected={selectedIds.has(entry.submission.id)}
            onToggle={() => toggleOne(entry.submission.id)}
          />
        ))}
      </ul>
    </div>
  );
}

function BulkActionBar({
  assignmentId,
  selectedIds,
  totalCount,
  onToggleAll,
  onClear,
}: {
  assignmentId: string;
  selectedIds: string[];
  totalCount: number;
  onToggleAll: () => void;
  onClear: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const allChecked = selectedIds.length === totalCount && totalCount > 0;
  const noneSelected = selectedIds.length === 0;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await bulkSetSubmissionStatusAction(assignmentId, selectedIds, formData);
      onClear();
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 bg-zinc-50 p-3 dark:border-white/10 dark:bg-zinc-900">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={allChecked}
          onChange={onToggleAll}
          aria-label="Select all submissions"
          className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
        />
        <span>
          {selectedIds.length === 0
            ? `${totalCount} submission${totalCount === 1 ? "" : "s"}`
            : `${selectedIds.length} selected`}
        </span>
      </label>

      <form action={handleSubmit} className="flex items-center gap-2">
        <select
          name="status"
          defaultValue="reviewed"
          disabled={noneSelected || isPending}
          className="h-9 rounded-md border border-zinc-200 bg-white px-2 text-xs disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <option value="reviewed">Reviewed</option>
          <option value="passed">Passed</option>
          <option value="failed">Failed</option>
          <option value="returned">Returned</option>
          <option value="submitted">Submitted</option>
        </select>
        <Button
          type="submit"
          size="sm"
          disabled={noneSelected || isPending}
        >
          {isPending
            ? "Applying..."
            : `Apply${selectedIds.length > 0 ? ` to ${selectedIds.length}` : ""}`}
        </Button>
      </form>
    </div>
  );
}

function SubmissionEntry({
  entry,
  maxScore,
  selected,
  onToggle,
}: {
  entry: SubmissionWithStudent;
  maxScore: number | null;
  selected: boolean;
  onToggle: () => void;
}) {
  const { submission, student } = entry;
  const studentName =
    student?.full_name?.trim() ||
    `${student?.first_name ?? ""} ${student?.last_name ?? ""}`.trim() ||
    student?.email ||
    "Student";

  return (
    <li
      className={`overflow-hidden rounded-xl border bg-white transition-colors dark:bg-zinc-950 ${
        selected
          ? "border-zinc-400 dark:border-zinc-500"
          : "border-black/10 dark:border-white/10"
      }`}
    >
      <div className="flex items-stretch">
        <label
          className="flex cursor-pointer items-center px-4"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggle}
            aria-label={`Select submission from ${studentName}`}
            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
          />
        </label>
        <details className="flex-1">
          <summary className="flex cursor-pointer items-center justify-between gap-3 px-2 py-3">
            <div className="min-w-0 space-y-1">
              <p className="truncate text-sm font-medium">{studentName}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {submission.submitted_at
                  ? `Submitted ${formatDateTime(submission.submitted_at)}`
                  : "Not yet submitted"}
                {submission.score != null && (
                  <>
                    {" · Score "}
                    <span className="font-medium">
                      {submission.score}
                      {maxScore != null && ` / ${maxScore}`}
                    </span>
                  </>
                )}
              </p>
            </div>
            <SubmissionStatusBadge status={submission.status} />
          </summary>
          <div className="space-y-4 border-t border-black/10 p-4 dark:border-white/10">
            {submission.submission_text && (
              <div>
                <p className="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Submission
                </p>
                <p className="whitespace-pre-wrap rounded-md bg-zinc-50 p-3 text-sm text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                  {submission.submission_text}
                </p>
              </div>
            )}
            {submission.storage_path && (
              <SubmissionFileButton submissionId={submission.id} />
            )}
            <ReviewForm submission={submission} maxScore={maxScore} />
          </div>
        </details>
      </div>
    </li>
  );
}

const reviewInitialState: ReviewActionState = { status: "idle" };

function ReviewSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Saving..." : "Save review"}
    </Button>
  );
}

function ReviewForm({
  submission,
  maxScore,
}: {
  submission: Tables<"assignment_submissions">;
  maxScore: number | null;
}) {
  const [state, action] = useActionState(
    reviewSubmissionAction,
    reviewInitialState,
  );

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="submission_id" value={submission.id} />

      {state.status === "error" && (
        <Alert variant="error">{state.message}</Alert>
      )}
      {state.status === "success" && (
        <Alert variant="success">{state.message}</Alert>
      )}

      <div className="grid gap-3 sm:grid-cols-[160px_140px_1fr_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor={`status-${submission.id}`}>Status</Label>
          <select
            id={`status-${submission.id}`}
            name="status"
            defaultValue={submission.status === "draft" ? "submitted" : submission.status}
            className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-2 text-xs dark:border-zinc-800 dark:bg-zinc-950"
          >
            <option value="submitted">Submitted</option>
            <option value="reviewed">Reviewed</option>
            <option value="returned">Returned</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`score-${submission.id}`}>
            Score{maxScore != null && ` / ${maxScore}`}
          </Label>
          <Input
            id={`score-${submission.id}`}
            name="score"
            type="number"
            min={0}
            step="0.5"
            defaultValue={submission.score?.toString() ?? ""}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-1">
          <Label htmlFor={`feedback-${submission.id}`}>Feedback</Label>
          <Textarea
            id={`feedback-${submission.id}`}
            name="feedback"
            rows={2}
            defaultValue={submission.feedback ?? ""}
          />
        </div>
        <ReviewSubmitButton />
      </div>
    </form>
  );
}
