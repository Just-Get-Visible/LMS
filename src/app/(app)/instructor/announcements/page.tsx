import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/user";
import { getInstructorAnnouncements } from "@/lib/data/announcements";
import { formatDateTime } from "@/lib/format";

export const metadata = {
  title: "Announcements · Instructor",
};

export default async function InstructorAnnouncementsPage() {
  const user = await requireUser();
  const announcements = await getInstructorAnnouncements(user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Announcements
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Updates posted to your courses and cohorts.
          </p>
        </div>
        <Link href="/instructor/announcements/new">
          <Button>New announcement</Button>
        </Link>
      </div>

      {announcements.length === 0 ? (
        <EmptyState
          title="No announcements yet"
          description="Post updates to keep your students informed."
          action={
            <Link href="/instructor/announcements/new">
              <Button>Compose announcement</Button>
            </Link>
          }
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-black/5 dark:divide-white/5">
              {announcements.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 space-y-1">
                    <Link
                      href={`/instructor/announcements/${a.id}`}
                      className="block truncate text-sm font-medium hover:underline"
                    >
                      {a.title}
                    </Link>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {a.is_published
                        ? `Published ${formatDateTime(a.published_at)}`
                        : "Draft"}
                    </p>
                  </div>
                  <Link
                    href={`/instructor/announcements/${a.id}`}
                    className="shrink-0 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    Edit →
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
