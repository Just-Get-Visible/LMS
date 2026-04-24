import Link from "next/link";
import { notFound } from "next/navigation";

import { AssignmentEditForm } from "@/components/assignments/assignment-form";
import { InstructorSubmissionsList } from "@/components/assignments/instructor-submissions-list";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { deleteAssignmentAction } from "@/lib/actions/assignments";
import { isAdmin } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/user";
import {
  getAssignmentById,
  getSubmissionsForAssignment,
} from "@/lib/data/assignments";
import { isCourseInstructor } from "@/lib/data/enrolments";

type Params = Promise<{ id: string }>;

export const metadata = {
  title: "Assignment · Instructor",
};

export default async function InstructorAssignmentPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const user = await requireUser();

  const assignment = await getAssignmentById(id);
  if (!assignment) notFound();

  const canManage =
    (await isCourseInstructor(user.id, assignment.course_id)) ||
    (await isAdmin(user.id));
  if (!canManage) notFound();

  const submissions = await getSubmissionsForAssignment(assignment.id);
  const pendingCount = submissions.filter(
    (s) => s.submission.status === "submitted",
  ).length;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Link
          href="/instructor/assignments"
          className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← All assignments
        </Link>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {assignment.title}
          </h1>
          <form action={deleteAssignmentAction.bind(null, assignment.id)}>
            <Button type="submit" variant="destructive" size="sm">
              Delete
            </Button>
          </form>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignment details</CardTitle>
        </CardHeader>
        <CardContent>
          <AssignmentEditForm assignment={assignment} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Submissions ({submissions.length})
            {pendingCount > 0 && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                {pendingCount} to review
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Expand a row to view the submission and add your review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InstructorSubmissionsList
            assignmentId={assignment.id}
            submissions={submissions}
            maxScore={assignment.max_score}
          />
        </CardContent>
      </Card>
    </div>
  );
}
