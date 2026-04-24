"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { Tables } from "@/types";

const JOIN_WINDOW_MIN = 15;

export function SessionActionArea({
  session,
}: {
  session: Tables<"live_sessions">;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const start = new Date(session.scheduled_start_at).getTime();
  const end = new Date(session.scheduled_end_at).getTime();
  const minutesUntil = Math.round((start - now) / 60_000);

  const isLive =
    session.status === "live" ||
    (session.status === "scheduled" && now >= start && now < end);
  const isImminent =
    session.status === "scheduled" &&
    !isLive &&
    minutesUntil >= 0 &&
    minutesUntil <= JOIN_WINDOW_MIN;
  const canJoin = (isLive || isImminent) && !!session.join_url;
  const showReplay = session.status === "completed" && !!session.replay_url;

  return (
    <div className="space-y-3">
      <StateBanner
        status={session.status}
        isLive={isLive}
        minutesUntil={minutesUntil}
      />
      <div className="flex flex-wrap gap-2">
        {canJoin && (
          <a
            href={session.join_url ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant={isLive ? "primary" : "outline"}>
              {isLive ? "Join now" : "Join session"}
            </Button>
          </a>
        )}
        {showReplay && (
          <a
            href={session.replay_url ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline">Watch replay</Button>
          </a>
        )}
      </div>
    </div>
  );
}

function StateBanner({
  status,
  isLive,
  minutesUntil,
}: {
  status: Tables<"live_sessions">["status"];
  isLive: boolean;
  minutesUntil: number;
}) {
  if (isLive) {
    return (
      <div className="inline-flex items-center gap-2 rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300">
        <span className="inline-block h-2 w-2 rounded-full bg-red-600 dark:bg-red-400" />
        Live now
      </div>
    );
  }
  if (status === "completed") {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        This session has ended.
      </p>
    );
  }
  if (status === "cancelled") {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        This session was cancelled.
      </p>
    );
  }
  if (minutesUntil >= 0 && minutesUntil <= JOIN_WINDOW_MIN) {
    return (
      <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
        {minutesUntil <= 1
          ? "Starting any moment"
          : `Starts in ${minutesUntil} min`}
      </p>
    );
  }
  return null;
}
