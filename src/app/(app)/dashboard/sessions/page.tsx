import { SessionCard } from "@/components/live-sessions/session-card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/user";
import { getStudentSessions } from "@/lib/data/live-sessions";

export const metadata = {
  title: "Sessions",
};

export default async function StudentSessionsPage() {
  await requireUser();
  const sessions = await getStudentSessions({ upcoming: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Upcoming sessions
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Live sessions across your courses and cohorts.
        </p>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          title="No upcoming sessions"
          description="When an instructor schedules one, it will appear here."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              detailHref={`/dashboard/sessions/${session.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
