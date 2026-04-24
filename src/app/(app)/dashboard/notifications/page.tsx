import { NotificationList } from "@/components/notifications/notification-list";
import { requireUser } from "@/lib/auth/user";
import { getMyNotifications } from "@/lib/data/notifications";

export const metadata = {
  title: "Notifications",
};

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = await getMyNotifications(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Updates from your courses, cohorts, and submissions.
        </p>
      </div>
      <NotificationList notifications={notifications} />
    </div>
  );
}
