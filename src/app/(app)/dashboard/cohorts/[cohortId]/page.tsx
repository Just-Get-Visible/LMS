import Link from "next/link";
import { notFound } from "next/navigation";

import { AnnouncementList } from "@/components/announcements/announcement-list";
import { CalendarSubscribe } from "@/components/cohorts/calendar-subscribe";
import { CohortSchedule } from "@/components/cohorts/cohort-schedule";
import { CohortStatusBadge } from "@/components/cohorts/cohort-status-badge";
import { Markdown } from "@/components/markdown";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUser } from "@/lib/auth/user";
import { makeCalendarToken } from "@/lib/calendar/tokens";
import { getAnnouncementsForCohort } from "@/lib/data/announcements";
import { getCohortById } from "@/lib/data/cohorts";
import { canAccessCohort } from "@/lib/data/enrolments";
import { getCohortSessions } from "@/lib/data/live-sessions";
import { getAppBaseUrl } from "@/lib/email/client";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/format";

type Params = Promise<{ cohortId: string }>;

export const metadata = {
  title: "Cohort",
};

export default async function StudentCohortDetailPage({
  params,
}: {
  params: Params;
}) {
  const { cohortId } = await params;
  const user = await requireUser();

  const canAccess = await canAccessCohort(user.id, cohortId);
  if (!canAccess) notFound();

  const cohort = await getCohortById(cohortId);
  if (!cohort) notFound();

  const supabase = await createClient();
  const [{ data: course }, sessions, announcements] = await Promise.all([
    supabase
      .from("courses")
      .select("id, slug, title")
      .eq("id", cohort.course_id)
      .maybeSingle(),
    getCohortSessions(cohortId),
    getAnnouncementsForCohort(cohortId),
  ]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Link
          href="/dashboard/cohorts"
          className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← All cohorts
        </Link>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {cohort.name}
          </h1>
          <CohortStatusBadge status={cohort.status} />
        </div>
        {course && (
          <Link
            href={`/dashboard/courses/${course.id}`}
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            {course.title} →
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {cohort.description && (
            <div className="mb-4">
              <Markdown className="text-sm">{cohort.description}</Markdown>
            </div>
          )}
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            {cohort.starts_at && (
              <Row label="Starts">{formatDateTime(cohort.starts_at)}</Row>
            )}
            {cohort.ends_at && (
              <Row label="Ends">{formatDateTime(cohort.ends_at)}</Row>
            )}
            {cohort.live_session_frequency && (
              <Row label="Sessions">{cohort.live_session_frequency}</Row>
            )}
            {cohort.timezone && <Row label="Timezone">{cohort.timezone}</Row>}
          </dl>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Schedule</h2>
        <CohortSchedule sessions={sessions} />
        <CalendarSubscribe
          feedUrl={`${getAppBaseUrl()}/api/calendar/cohort/${cohortId}?token=${encodeURIComponent(
            makeCalendarToken(cohortId, user.id),
          )}`}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Announcements</h2>
        <AnnouncementList
          announcements={announcements}
          emptyTitle="No announcements yet"
          emptyDescription="Updates posted to this cohort will appear here."
        />
      </section>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="mt-1 font-medium">{children}</dd>
    </div>
  );
}
