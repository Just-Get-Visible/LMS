import Link from "next/link";

import { ThreadCard } from "@/components/discussions/thread-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/user";
import { getAccessibleThreads } from "@/lib/data/discussions";

export const metadata = {
  title: "Discussions",
};

export default async function DiscussionsPage() {
  await requireUser();
  const threads = await getAccessibleThreads();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Discussions</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Threads from your courses and cohorts.
          </p>
        </div>
        <Link href="/dashboard/discussions/new">
          <Button>New thread</Button>
        </Link>
      </div>

      {threads.length === 0 ? (
        <EmptyState
          title="No discussions yet"
          description="Start a thread to ask questions or share notes."
          action={
            <Link href="/dashboard/discussions/new">
              <Button>Create thread</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {threads.map((item) => (
            <ThreadCard key={item.thread.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
