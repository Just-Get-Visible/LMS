import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/actions/notifications";
import { formatDateTime } from "@/lib/format";
import type { Tables } from "@/types";

export function NotificationList({
  notifications,
}: {
  notifications: Tables<"notifications">[];
}) {
  if (notifications.length === 0) {
    return (
      <EmptyState
        title="No notifications"
        description="You're all caught up."
      />
    );
  }

  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <div className="space-y-4">
      {hasUnread && (
        <div className="flex justify-end">
          <form action={markAllNotificationsReadAction}>
            <Button type="submit" size="sm" variant="ghost">
              Mark all as read
            </Button>
          </form>
        </div>
      )}

      <ul className="divide-y divide-black/5 overflow-hidden rounded-xl border border-black/10 dark:divide-white/5 dark:border-white/10">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
          />
        ))}
      </ul>
    </div>
  );
}

function NotificationItem({
  notification,
}: {
  notification: Tables<"notifications">;
}) {
  return (
    <li
      className={`flex items-start justify-between gap-3 bg-white px-4 py-3 dark:bg-zinc-950 ${
        notification.is_read ? "" : "bg-blue-50/40 dark:bg-blue-950/20"
      }`}
    >
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          {!notification.is_read && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
          )}
          {notification.link_url ? (
            <Link
              href={notification.link_url}
              className="truncate text-sm font-medium hover:underline"
            >
              {notification.title}
            </Link>
          ) : (
            <span className="truncate text-sm font-medium">
              {notification.title}
            </span>
          )}
        </div>
        {notification.body && (
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            {notification.body}
          </p>
        )}
        <p className="text-xs text-zinc-500 dark:text-zinc-500">
          {formatDateTime(notification.created_at)}
        </p>
      </div>
      <form
        action={markNotificationReadAction.bind(
          null,
          notification.id,
          !notification.is_read,
        )}
      >
        <Button type="submit" size="sm" variant="ghost">
          {notification.is_read ? "Mark unread" : "Mark read"}
        </Button>
      </form>
    </li>
  );
}
