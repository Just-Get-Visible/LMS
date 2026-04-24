import { AnnouncementCard } from "@/components/announcements/announcement-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { Tables } from "@/types";

export function AnnouncementList({
  announcements,
  emptyTitle = "No announcements yet",
  emptyDescription,
}: {
  announcements: Tables<"announcements">[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (announcements.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={
          emptyDescription ?? "When your instructor posts an update, it will appear here."
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement) => (
        <AnnouncementCard key={announcement.id} announcement={announcement} />
      ))}
    </div>
  );
}
