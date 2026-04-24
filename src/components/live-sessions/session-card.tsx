import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import type { Tables } from "@/types";

const statusColors = {
  scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
  live: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  completed:
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
} as const;

export function SessionCard({
  session,
  detailHref,
}: {
  session: Tables<"live_sessions">;
  detailHref: string;
}) {
  const isUpcoming =
    session.status === "scheduled" &&
    new Date(session.scheduled_start_at) > new Date();
  const hasReplay = session.status === "completed" && session.replay_url;

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <Link
            href={detailHref}
            className="block truncate font-medium tracking-tight hover:underline"
          >
            {session.title}
          </Link>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {formatDateTime(session.scheduled_start_at)}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${statusColors[session.status]}`}
        >
          {session.status}
        </span>
      </div>
      {(isUpcoming || hasReplay) && (
        <div className="mt-4 flex gap-2">
          {isUpcoming && session.join_url && (
            <a
              href={session.join_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm">Join</Button>
            </a>
          )}
          {hasReplay && (
            <a
              href={session.replay_url!}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" variant="outline">
                Watch replay
              </Button>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
