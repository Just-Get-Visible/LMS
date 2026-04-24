import Link from "next/link";
import { notFound } from "next/navigation";

import { PostComposer } from "@/components/discussions/post-composer";
import { PostList } from "@/components/discussions/post-list";
import { ThreadActions } from "@/components/discussions/thread-actions";
import { Markdown } from "@/components/markdown";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isAdmin } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/user";
import { getPostsForThread, getThreadById } from "@/lib/data/discussions";
import {
  isCohortInstructor,
  isCourseInstructor,
} from "@/lib/data/enrolments";
import { formatDateTime } from "@/lib/format";

type Params = Promise<{ threadId: string }>;

export const metadata = {
  title: "Thread",
};

export default async function ThreadDetailPage({
  params,
}: {
  params: Params;
}) {
  const { threadId } = await params;
  const user = await requireUser();

  const thread = await getThreadById(threadId);
  if (!thread) notFound();

  const [posts, canManage] = await Promise.all([
    getPostsForThread(threadId),
    (async () => {
      if (await isAdmin(user.id)) return true;
      if (
        thread.cohort_id &&
        (await isCohortInstructor(user.id, thread.cohort_id))
      )
        return true;
      if (
        thread.course_id &&
        (await isCourseInstructor(user.id, thread.course_id))
      )
        return true;
      return false;
    })(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <Link
          href="/dashboard/discussions"
          className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← All discussions
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
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
              <h1 className="text-2xl font-semibold tracking-tight">
                {thread.title}
              </h1>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Posted {formatDateTime(thread.created_at)}
            </p>
          </div>
          {canManage && <ThreadActions thread={thread} />}
        </div>
      </div>

      {thread.body && (
        <Card>
          <CardContent className="pt-6">
            <Markdown className="text-sm">{thread.body}</Markdown>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Replies</h2>
        <PostList
          threadId={thread.id}
          posts={posts}
          isLocked={thread.is_locked}
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Add a reply</CardTitle>
        </CardHeader>
        <CardContent>
          <PostComposer threadId={thread.id} isLocked={thread.is_locked} />
        </CardContent>
      </Card>
    </div>
  );
}
