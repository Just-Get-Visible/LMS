import Link from "next/link";
import { notFound } from "next/navigation";

import { SubmissionStatusBadge } from "@/components/assignments/submission-status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isAdmin } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/user";
import { isCohortInstructor } from "@/lib/data/enrolments";
import { getStudentCohortDetail } from "@/lib/data/instructor";
import { formatDateTime } from "@/lib/format";

type Params = Promise<{ cohortId: string; userId: string }>;

export const metadata = {
  title: "Student progress · Instructor",
};

export default async function StudentCohortDetailPage({
  params,
}: {
  params: Params;
}) {
  const { cohortId, userId } = await params;
  const user = await requireUser();

  const canManage =
    (await isCohortInstructor(user.id, cohortId)) || (await isAdmin(user.id));
  if (!canManage) notFound();

  const detail = await getStudentCohortDetail(cohortId, userId);
  if (!detail.profile) notFound();

  const completedLessonIds = new Set(
    detail.lessonProgress
      .filter((lp) => lp.is_completed)
      .map((lp) => lp.lesson_id),
  );
  const totalLessons = detail.lessons.length;
  const completedLessons = detail.lessons.filter((l) =>
    completedLessonIds.has(l.id),
  ).length;
  const progressPercent =
    detail.courseProgress?.progress_percent ??
    (totalLessons === 0
      ? 0
      : Math.round((completedLessons / totalLessons) * 100));

  const attendedCount = detail.sessions.filter(
    (s) => s.attendance?.status === "attended",
  ).length;
  const heldSessions = detail.sessions.filter(
    (s) =>
      s.session.status === "completed" || s.session.status === "live",
  ).length;

  const name =
    detail.profile.full_name?.trim() ||
    `${detail.profile.first_name ?? ""} ${detail.profile.last_name ?? ""}`.trim() ||
    "Student";

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/instructor/cohorts/${cohortId}`}
          className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← Back to cohort
        </Link>
        <div className="mt-3 flex items-center gap-4">
          {detail.profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={detail.profile.avatar_url}
              alt=""
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div
              aria-hidden
              className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-base font-semibold text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
            >
              {name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
            {detail.profile.email && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {detail.profile.email}
              </p>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course progress</CardTitle>
          <CardDescription>
            {completedLessons} / {totalLessons} lessons complete ·{" "}
            {progressPercent}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          {totalLessons === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              The course has no published lessons yet.
            </p>
          ) : (
            <ul className="divide-y divide-black/5 dark:divide-white/5">
              {detail.lessons.map((lesson) => (
                <li
                  key={lesson.id}
                  className="flex items-center justify-between gap-3 py-2 text-sm"
                >
                  <span
                    className={
                      completedLessonIds.has(lesson.id)
                        ? "text-zinc-700 dark:text-zinc-300"
                        : "text-zinc-500 dark:text-zinc-500"
                    }
                  >
                    {lesson.title}
                  </span>
                  <span className="text-xs">
                    {completedLessonIds.has(lesson.id) ? (
                      <span className="text-emerald-700 dark:text-emerald-400">
                        ✓ Done
                      </span>
                    ) : (
                      <span className="text-zinc-400 dark:text-zinc-600">
                        —
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
          <CardDescription>
            Submissions for this cohort&apos;s assignments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {detail.assignments.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No assignments in this cohort.
            </p>
          ) : (
            <ul className="divide-y divide-black/5 dark:divide-white/5">
              {detail.assignments.map(({ assignment, submission }) => (
                <li
                  key={assignment.id}
                  className="flex items-center justify-between gap-3 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{assignment.title}</p>
                    {assignment.due_at && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Due {formatDateTime(assignment.due_at)}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {submission ? (
                      <>
                        <SubmissionStatusBadge status={submission.status} />
                        {submission.score != null && (
                          <span className="text-xs">
                            {submission.score}
                            {assignment.max_score != null
                              ? ` / ${assignment.max_score}`
                              : ""}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        Not submitted
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance</CardTitle>
          <CardDescription>
            {attendedCount} attended out of {heldSessions} held sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {detail.sessions.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No sessions scheduled for this cohort.
            </p>
          ) : (
            <ul className="divide-y divide-black/5 dark:divide-white/5">
              {detail.sessions.map(({ session, attendance }) => (
                <li
                  key={session.id}
                  className="flex items-center justify-between gap-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{session.title}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {formatDateTime(session.scheduled_start_at)}
                    </p>
                  </div>
                  <span className="text-xs capitalize text-zinc-700 dark:text-zinc-300">
                    {attendance?.status ?? "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
