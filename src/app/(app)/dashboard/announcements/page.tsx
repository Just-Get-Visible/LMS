import { AnnouncementList } from "@/components/announcements/announcement-list";
import { requireUser } from "@/lib/auth/user";
import { getStudentAnnouncements } from "@/lib/data/announcements";

export const metadata = {
  title: "Announcements",
};

export default async function StudentAnnouncementsPage() {
  await requireUser();
  const announcements = await getStudentAnnouncements();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Announcements
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Updates from your courses and cohorts.
        </p>
      </div>
      <AnnouncementList announcements={announcements} />
    </div>
  );
}
