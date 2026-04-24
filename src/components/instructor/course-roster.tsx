"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addCourseEnrolmentAction,
  removeCourseEnrolmentAction,
  updateCourseEnrolmentStatusAction,
  type CourseEnrolmentActionState,
} from "@/lib/actions/course-enrolments";
import type { CourseStudentItem } from "@/lib/data/courses";
import { formatDateTime } from "@/lib/format";

const initialState: CourseEnrolmentActionState = { status: "idle" };

function AddSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="sm">
      {pending ? "Adding..." : "Add student"}
    </Button>
  );
}

interface Props {
  courseId: string;
  students: CourseStudentItem[];
}

export function CourseRoster({ courseId, students }: Props) {
  const [state, action] = useActionState(
    addCourseEnrolmentAction,
    initialState,
  );

  return (
    <div className="space-y-4">
      <form
        action={action}
        className="grid gap-3 sm:grid-cols-[2fr_1fr_auto] sm:items-end"
      >
        <input type="hidden" name="course_id" value={courseId} />

        <div className="space-y-1.5">
          <Label htmlFor="add-course-enrolment-email">Student email</Label>
          <Input
            id="add-course-enrolment-email"
            name="email"
            type="email"
            required
            placeholder="student@example.com"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="add-course-enrolment-status">Status</Label>
          <select
            id="add-course-enrolment-status"
            name="status"
            defaultValue="active"
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <AddSubmitButton />
      </form>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Bypasses payment. The student must already have an account. They will
        receive a welcome email with a deep link to the first lesson.
      </p>

      {state.status === "error" && (
        <Alert variant="error">{state.message}</Alert>
      )}
      {state.status === "success" && (
        <Alert variant="success">{state.message}</Alert>
      )}

      {students.length === 0 ? (
        <p className="rounded-md bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
          No students enrolled yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-2 font-medium">Student</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Source</th>
                <th className="px-4 py-2 font-medium">Enrolled</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {students.map(({ enrolment, profile }) => (
                <tr key={enrolment.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">
                      {profile?.full_name?.trim() ||
                        `${profile?.first_name ?? ""} ${
                          profile?.last_name ?? ""
                        }`.trim() ||
                        "Student"}
                    </p>
                    {profile?.email && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {profile.email}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <form
                      action={updateCourseEnrolmentStatusAction.bind(
                        null,
                        courseId,
                        enrolment.id,
                      )}
                      className="flex items-center gap-2"
                    >
                      <select
                        name="status"
                        defaultValue={enrolment.status}
                        className="h-8 rounded-md border border-zinc-200 bg-white px-2 text-xs dark:border-zinc-800 dark:bg-zinc-950"
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="expired">Expired</option>
                        <option value="refunded">Refunded</option>
                      </select>
                      <Button type="submit" size="sm" variant="ghost">
                        Save
                      </Button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                    {enrolment.source ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                    {formatDateTime(enrolment.enrolled_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form
                      action={removeCourseEnrolmentAction.bind(
                        null,
                        courseId,
                        enrolment.id,
                      )}
                    >
                      <Button type="submit" size="sm" variant="destructive">
                        Remove
                      </Button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
