import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/format";
import type { Tables } from "@/types";

export function CohortSchedule({
  sessions,
}: {
  sessions: Tables<"live_sessions">[];
}) {
  if (sessions.length === 0) {
    return (
      <EmptyState
        title="No scheduled sessions"
        description="Sessions will appear here once your instructor schedules them."
      />
    );
  }

  return (
    <ul className="divide-y divide-black/5 overflow-hidden rounded-xl border border-black/10 dark:divide-white/5 dark:border-white/10">
      {sessions.map((session) => (
        <SessionRow key={session.id} session={session} />
      ))}
    </ul>
  );
}

function SessionRow({ session }: { session: Tables<"live_sessions"> }) {
  const isUpcoming =
    session.status === "scheduled" &&
    new Date(session.scheduled_start_at) > new Date();
  const hasReplay = session.status === "completed" && session.replay_url;

  return (
    <li className="flex items-center justify-between gap-4 bg-white px-4 py-3 dark:bg-zinc-950">
      <div className="min-w-0 space-y-1">
        <p className="truncate text-sm font-medium">{session.title}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {formatDateTime(session.scheduled_start_at)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <StatusBadge status={session.status} />
        {isUpcoming && session.join_url && (
          <a href={session.join_url} target="_blank" rel="noopener noreferrer">
            <Button size="sm">Join</Button>
          </a>
        )}
        {hasReplay && (
          <a href={session.replay_url!} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline">
              Replay
            </Button>
          </a>
        )}
      </div>
    </li>
  );
}

function StatusBadge({
  status,
}: {
  status: Tables<"live_sessions">["status"];
}) {
  const colors = {
    scheduled:
      "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
    live: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
    completed:
      "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    cancelled:
      "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
  } as const;
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${colors[status]}`}
    >
      {status}
    </span>
  );
}
