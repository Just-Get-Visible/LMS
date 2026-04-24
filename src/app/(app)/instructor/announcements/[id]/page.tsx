import Link from "next/link";
import { notFound } from "next/navigation";

import { AnnouncementEditForm } from "@/components/announcements/announcement-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  deleteAnnouncementAction,
  setAnnouncementPublishAction,
} from "@/lib/actions/announcements";
import { isAdmin } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/user";
import { getAnnouncementById } from "@/lib/data/announcements";
import { formatDateTime } from "@/lib/format";

type Params = Promise<{ id: string }>;

export const metadata = {
  title: "Announcement · Instructor",
};

export default async function InstructorAnnouncementPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const user = await requireUser();

  const announcement = await getAnnouncementById(id);
  if (!announcement) notFound();

  const canManage =
    announcement.created_by === user.id || (await isAdmin(user.id));
  if (!canManage) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/instructor/announcements"
          className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← All announcements
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {announcement.title}
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {announcement.is_published
            ? `Published ${formatDateTime(announcement.published_at)}`
            : "Draft"}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {announcement.is_published
            ? "Visible to entitled students."
            : "Hidden from students until published."}
        </p>
        <div className="flex items-center gap-2">
          <form
            action={setAnnouncementPublishAction.bind(
              null,
              announcement.id,
              !announcement.is_published,
            )}
          >
            <Button type="submit" size="sm">
              {announcement.is_published ? "Unpublish" : "Publish"}
            </Button>
          </form>
          <form
            action={deleteAnnouncementAction.bind(null, announcement.id)}
          >
            <Button type="submit" size="sm" variant="destructive">
              Delete
            </Button>
          </form>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit announcement</CardTitle>
        </CardHeader>
        <CardContent>
          <AnnouncementEditForm announcement={announcement} />
        </CardContent>
      </Card>
    </div>
  );
}
