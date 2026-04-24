"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Tables } from "@/types";

const JOIN_WINDOW_MIN = 15;

export function UpcomingSessionsWidget({
  sessions,
}: {
  sessions: Tables<"live_sessions">[];
}) {
  // Re-tick every 30s so "Starts in X min" decrements and the Join button
  // appears when a session goes live without requiring a page refresh.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming sessions</CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No upcoming live sessions.
          </p>
        ) : (
          <ul className="space-y-4">
            {sessions.map((session) => (
              <SessionRow key={session.id} session={session} now={now} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function SessionRow({
  session,
  now,
}: {
  session: Tables<"live_sessions">;
  now: number;
}) {
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
  const showReplay =
    session.status === "completed" && !!session.replay_url;

  return (
    <li className="space-y-2">
      <div>
        <p className="text-sm font-medium">{session.title}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          <SessionStateLabel
            session={session}
            now={now}
            isLive={isLive}
            minutesUntil={minutesUntil}
          />
        </p>
      </div>
      {canJoin ? (
        <a
          href={session.join_url ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="sm" variant={isLive ? "primary" : "outline"}>
            {isLive ? "Join now" : "Join"}
          </Button>
        </a>
      ) : showReplay ? (
        <a
          href={session.replay_url ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="sm" variant="outline">
            Watch replay
          </Button>
        </a>
      ) : null}
    </li>
  );
}

function SessionStateLabel({
  session,
  now,
  isLive,
  minutesUntil,
}: {
  session: Tables<"live_sessions">;
  now: number;
  isLive: boolean;
  minutesUntil: number;
}) {
  if (isLive) {
    return (
      <span className="inline-flex items-center gap-1.5 font-medium text-red-600 dark:text-red-400">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-600 dark:bg-red-400" />
        Live now
      </span>
    );
  }
  if (session.status === "completed") return <>Ended</>;
  if (session.status === "cancelled") return <>Cancelled</>;
  if (minutesUntil >= 0 && minutesUntil <= JOIN_WINDOW_MIN) {
    return (
      <span className="font-medium text-amber-700 dark:text-amber-400">
        {minutesUntil <= 1
          ? "Starting any moment"
          : `Starts in ${minutesUntil} min`}
      </span>
    );
  }
  return <>{formatWhen(session.scheduled_start_at, now)}</>;
}

function formatWhen(iso: string, nowMs: number): string {
  const d = new Date(iso);
  const isToday = new Date(nowMs).toDateString() === d.toDateString();
  try {
    if (isToday) {
      return `Today, ${new Intl.DateTimeFormat("en-GB", {
        hour: "numeric",
        minute: "2-digit",
      }).format(d)}`;
    }
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    }).format(d);
  } catch {
    return iso;
  }
}
