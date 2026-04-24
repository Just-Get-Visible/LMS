import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/user";
import { getInstructorSessions } from "@/lib/data/live-sessions";
import { formatDateTime } from "@/lib/format";

export const metadata = {
  title: "Sessions · Instructor",
};

export default async function InstructorSessionsPage() {
  const user = await requireUser();
  const sessions = await getInstructorSessions(user.id);

  const now = Date.now();
  const upcoming = sessions.filter(
    (s) => new Date(s.scheduled_start_at).getTime() >= now,
  );
  const past = sessions.filter(
    (s) => new Date(s.scheduled_start_at).getTime() < now,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Live sessions
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Schedule and manage live sessions for your courses and cohorts.
          </p>
        </div>
        <Link href="/instructor/sessions/new">
          <Button>New session</Button>
        </Link>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          title="No sessions yet"
          description="Schedule your first live session for a cohort or course."
          action={
            <Link href="/instructor/sessions/new">
              <Button>Create session</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <SessionsCard title="Upcoming" sessions={upcoming.reverse()} />
          )}
          {past.length > 0 && <SessionsCard title="Past" sessions={past} />}
        </div>
      )}
    </div>
  );
}

function SessionsCard({
  title,
  sessions,
}: {
  title: string;
  sessions: Awaited<ReturnType<typeof getInstructorSessions>>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-black/5 dark:divide-white/5">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0 space-y-1">
                <Link
                  href={`/instructor/sessions/${session.id}`}
                  className="block truncate text-sm font-medium hover:underline"
                >
                  {session.title}
                </Link>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {formatDateTime(session.scheduled_start_at)} ·{" "}
                  <span className="capitalize">{session.status}</span>
                </p>
              </div>
              <Link
                href={`/instructor/sessions/${session.id}`}
                className="shrink-0 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Manage →
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
