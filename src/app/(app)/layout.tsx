import Link from "next/link";
import type { ReactNode } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { SectionNav } from "@/components/layout/section-nav";
import { NotificationsLink } from "@/components/notifications/notifications-link";
import { getCurrentProfile, requireUser } from "@/lib/auth/user";
import { getUserRoles } from "@/lib/auth/roles";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const [profile, roles] = await Promise.all([
    getCurrentProfile(),
    getUserRoles(user.id),
  ]);

  const canSeeInstructor =
    roles.includes("instructor") || roles.includes("admin");
  const canSeeAdmin = roles.includes("admin");

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-black/10 bg-white dark:border-white/10 dark:bg-zinc-950">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-4">
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/dashboard" className="font-semibold tracking-tight">
              LMS
            </Link>
            <Link
              href="/dashboard"
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Dashboard
            </Link>
            {canSeeInstructor && (
              <Link
                href="/instructor"
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Instructor
              </Link>
            )}
            {canSeeAdmin && (
              <Link
                href="/admin"
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Admin
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-3">
            <NotificationsLink userId={user.id} />
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="h-7 w-7 rounded-full border border-black/10 object-cover dark:border-white/10"
                />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {(profile?.full_name?.trim()?.[0] ??
                    profile?.email?.[0] ??
                    user.email?.[0] ??
                    "?")
                    .toUpperCase()}
                </span>
              )}
              <span className="hidden sm:inline">
                {profile?.full_name?.trim() || profile?.email || user.email}
              </span>
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <SectionNav />
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}
