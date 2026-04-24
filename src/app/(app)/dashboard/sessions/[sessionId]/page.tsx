import Link from "next/link";
import { notFound } from "next/navigation";

import { SessionActionArea } from "@/components/live-sessions/session-action-area";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUser } from "@/lib/auth/user";
import { getSessionById } from "@/lib/data/live-sessions";
import { formatDateTime } from "@/lib/format";

type Params = Promise<{ sessionId: string }>;

export const metadata = {
  title: "Session",
};

export default async function StudentSessionDetailPage({
  params,
}: {
  params: Params;
}) {
  const { sessionId } = await params;
  await requireUser();

  const session = await getSessionById(sessionId);
  if (!session) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/dashboard/sessions"
          className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← All sessions
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {session.title}
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {formatDateTime(session.scheduled_start_at)} —{" "}
          {formatDateTime(session.scheduled_end_at)}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {session.description && (
            <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
              {session.description}
            </p>
          )}

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Row label="Status" capitalize>
              {session.status}
            </Row>
            <Row label="Provider" capitalize>
              {session.provider ?? "—"}
            </Row>
            {session.timezone && (
              <Row label="Timezone">{session.timezone}</Row>
            )}
            {session.is_recorded && <Row label="Recording">Enabled</Row>}
          </dl>

          <div className="pt-2">
            <SessionActionArea session={session} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({
  label,
  children,
  capitalize,
}: {
  label: string;
  children: React.ReactNode;
  capitalize?: boolean;
}) {
  return (
    <div>
      <dt className="text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className={`mt-1 font-medium ${capitalize ? "capitalize" : ""}`}>
        {children}
      </dd>
    </div>
  );
}
