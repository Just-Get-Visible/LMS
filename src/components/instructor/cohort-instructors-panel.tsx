"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addCohortInstructorAction,
  removeCohortInstructorAction,
  type CohortInstructorActionState,
} from "@/lib/actions/cohort-instructors";
import type { CohortInstructorItem } from "@/lib/data/cohorts";

const initialState: CohortInstructorActionState = { status: "idle" };

function AddSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="sm">
      {pending ? "Adding..." : "Add"}
    </Button>
  );
}

interface Props {
  cohortId: string;
  instructors: CohortInstructorItem[];
}

export function CohortInstructorsPanel({ cohortId, instructors }: Props) {
  const [state, action] = useActionState(
    addCohortInstructorAction,
    initialState,
  );

  return (
    <div className="space-y-4">
      <form
        action={action}
        className="grid gap-3 sm:grid-cols-[2fr_1fr_auto] sm:items-end"
      >
        <input type="hidden" name="cohort_id" value={cohortId} />
        <div className="space-y-1.5">
          <Label htmlFor="add-instructor-email">Email</Label>
          <Input
            id="add-instructor-email"
            name="email"
            type="email"
            required
            placeholder="mentor@example.com"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="add-instructor-role">Role</Label>
          <Input
            id="add-instructor-role"
            name="role"
            placeholder="mentor / lead / TA"
            defaultValue="mentor"
          />
        </div>
        <AddSubmitButton />
      </form>

      {state.status === "error" && (
        <Alert variant="error">{state.message}</Alert>
      )}
      {state.status === "success" && (
        <Alert variant="success">{state.message}</Alert>
      )}

      {instructors.length === 0 ? (
        <p className="rounded-md bg-zinc-50 px-4 py-4 text-center text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
          No mentors assigned yet.
        </p>
      ) : (
        <ul className="divide-y divide-black/5 overflow-hidden rounded-xl border border-black/10 dark:divide-white/5 dark:border-white/10">
          {instructors.map(({ link, profile }) => (
            <li
              key={link.id}
              className="flex items-center justify-between gap-3 bg-white px-4 py-3 dark:bg-zinc-950"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {profile?.full_name?.trim() || profile?.email || "Mentor"}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {link.role ?? "mentor"}
                </p>
              </div>
              <form
                action={removeCohortInstructorAction.bind(
                  null,
                  cohortId,
                  link.id,
                )}
              >
                <Button type="submit" size="sm" variant="ghost">
                  Remove
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
