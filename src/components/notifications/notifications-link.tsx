import Link from "next/link";

import { getMyUnreadNotificationCount } from "@/lib/data/notifications";

export async function NotificationsLink({ userId }: { userId: string }) {
  const count = await getMyUnreadNotificationCount(userId);

  return (
    <Link
      href="/dashboard/notifications"
      className="relative text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      aria-label={count > 0 ? `Notifications (${count} unread)` : "Notifications"}
    >
      Notifications
      {count > 0 && (
        <span className="ml-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-medium text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
