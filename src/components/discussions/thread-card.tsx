import Link from "next/link";

import type { ThreadListItem } from "@/lib/data/discussions";
import { formatDateTime } from "@/lib/format";

export function ThreadCard({ item }: { item: ThreadListItem }) {
  const { thread, scopeLabel, scopeName } = item;
  return (
    <Link
      href={`/dashboard/discussions/${thread.id}`}
      className="block rounded-xl border border-black/10 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-white/10 dark:bg-zinc-950"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            {thread.is_pinned && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                Pinned
              </span>
            )}
            {thread.is_locked && (
              <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                Locked
              </span>
            )}
            <h3 className="truncate font-medium tracking-tight">
              {thread.title}
            </h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {scopeLabel}
            {scopeName && ` · ${scopeName}`}
            <span> · Updated {formatDateTime(thread.updated_at)}</span>
          </p>
        </div>
      </div>
      {thread.body && (
        <p className="mt-3 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
          {thread.body}
        </p>
      )}
    </Link>
  );
}
