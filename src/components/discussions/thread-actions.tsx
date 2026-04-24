import { Button } from "@/components/ui/button";
import {
  deleteThreadAction,
  setThreadLockAction,
  setThreadPinAction,
} from "@/lib/actions/discussions";
import type { Tables } from "@/types";

export function ThreadActions({
  thread,
}: {
  thread: Tables<"discussion_threads">;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action={setThreadPinAction.bind(null, thread.id, !thread.is_pinned)}>
        <Button type="submit" size="sm" variant="ghost">
          {thread.is_pinned ? "Unpin" : "Pin"}
        </Button>
      </form>
      <form
        action={setThreadLockAction.bind(null, thread.id, !thread.is_locked)}
      >
        <Button type="submit" size="sm" variant="ghost">
          {thread.is_locked ? "Unlock" : "Lock"}
        </Button>
      </form>
      <form action={deleteThreadAction.bind(null, thread.id)}>
        <Button type="submit" size="sm" variant="destructive">
          Delete
        </Button>
      </form>
    </div>
  );
}
