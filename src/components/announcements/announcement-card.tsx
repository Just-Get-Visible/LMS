import { Markdown } from "@/components/markdown";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import type { Tables } from "@/types";

export function AnnouncementCard({
  announcement,
}: {
  announcement: Tables<"announcements">;
}) {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle>{announcement.title}</CardTitle>
        {announcement.published_at && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {formatDateTime(announcement.published_at)}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Markdown className="text-sm">{announcement.body}</Markdown>
      </CardContent>
    </Card>
  );
}
