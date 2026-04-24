import Link from "next/link";

import { getMyUnreadNotificationCount } from "@/lib/data/notifications";

export async function NotificationBell({ userId }: { userId: string }) {
  const count = await getMyUnreadNotificationCount(userId);
  const display = count > 99 ? "99+" : String(count);

  return (
    <Link
      href="/dashboard/notifications"
      aria-label={
        count > 0
          ? `Notifications: ${count} unread`
          : "Notifications"
      }
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
    >
      <BellIcon />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-[18px] text-white">
          {display}
        </span>
      )}
    </Link>
  );
}

function BellIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
