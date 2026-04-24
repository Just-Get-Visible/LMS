import { Button } from "@/components/ui/button";
import {
  deleteSessionAction,
  setSessionStatusAction,
} from "@/lib/actions/live-sessions";
import type { Tables } from "@/types";

export function SessionActionsBar({
  session,
}: {
  session: Tables<"live_sessions">;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
      <div className="space-y-1">
        <p className="text-sm font-medium">
          Status: <span className="capitalize">{session.status}</span>
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Use these to mark when the session goes live or wraps up.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {session.status !== "live" && (
          <form action={setSessionStatusAction.bind(null, session.id, "live")}>
            <Button type="submit" size="sm">
              Mark live
            </Button>
          </form>
        )}
        {session.status !== "completed" && (
          <form
            action={setSessionStatusAction.bind(null, session.id, "completed")}
          >
            <Button type="submit" size="sm" variant="secondary">
              Mark completed
            </Button>
          </form>
        )}
        {session.status !== "scheduled" && (
          <form
            action={setSessionStatusAction.bind(null, session.id, "scheduled")}
          >
            <Button type="submit" size="sm" variant="ghost">
              Reset to scheduled
            </Button>
          </form>
        )}
        {session.status !== "cancelled" && (
          <form
            action={setSessionStatusAction.bind(null, session.id, "cancelled")}
          >
            <Button type="submit" size="sm" variant="ghost">
              Cancel
            </Button>
          </form>
        )}
        <form action={deleteSessionAction.bind(null, session.id)}>
          <Button type="submit" size="sm" variant="destructive">
            Delete
          </Button>
        </form>
      </div>
    </div>
  );
}
