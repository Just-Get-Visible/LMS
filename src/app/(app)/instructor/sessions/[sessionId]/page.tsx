import Link from "next/link";
import { notFound } from "next/navigation";

import { AttendanceTable } from "@/components/instructor/attendance-table";
import { SessionActionsBar } from "@/components/live-sessions/session-actions-bar";
import { SessionEditForm } from "@/components/live-sessions/session-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isAdmin } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/user";
import { getSessionAttendanceRoster } from "@/lib/data/attendance";
import {
  isCohortInstructor,
  isCourseInstructor,
} from "@/lib/data/enrolments";
import { getSessionById } from "@/lib/data/live-sessions";

type Params = Promise<{ sessionId: string }>;

export const metadata = {
  title: "Session · Instructor",
};

export default async function InstructorSessionPage({
  params,
}: {
  params: Params;
}) {
  const { sessionId } = await params;
  const user = await requireUser();

  const session = await getSessionById(sessionId);
  if (!session) notFound();

  const canManage =
    (await isAdmin(user.id)) ||
    session.host_user_id === user.id ||
    (session.cohort_id
      ? await isCohortInstructor(user.id, session.cohort_id)
      : false) ||
    (session.course_id
      ? await isCourseInstructor(user.id, session.course_id)
      : false);

  if (!canManage) notFound();

  const roster = await getSessionAttendanceRoster(sessionId);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Link
          href="/instructor/sessions"
          className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← All sessions
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          {session.title}
        </h1>
      </div>

      <SessionActionsBar session={session} />

      <Card>
        <CardHeader>
          <CardTitle>Session details</CardTitle>
        </CardHeader>
        <CardContent>
          <SessionEditForm session={session} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance ({roster.length})</CardTitle>
          <CardDescription>
            Mark each attendee&apos;s status. Notes are visible only to
            instructors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AttendanceTable sessionId={session.id} rows={roster} />
        </CardContent>
      </Card>
    </div>
  );
}
