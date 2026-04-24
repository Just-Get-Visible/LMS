import Link from "next/link";

import { AccountMenu } from "@/components/layout/account-menu";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { NavLink } from "@/components/layout/nav-link";
import { NotificationBell } from "@/components/layout/notification-bell";
import { Button } from "@/components/ui/button";
import { getUserRoles } from "@/lib/auth/roles";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/user";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const profile = user ? await getCurrentProfile() : null;
  const roles = user ? await getUserRoles(user.id) : [];
  const isAdmin = roles.includes("admin");
  const isInstructor = isAdmin || roles.includes("instructor");

  const mobileItems = [
    { href: "/courses", label: "Courses" },
    { href: "/cohorts", label: "Cohorts" },
    { href: "/instructors", label: "Instructors" },
    ...(user ? [{ href: "/dashboard", label: "Dashboard" }] : []),
    ...(isInstructor ? [{ href: "/instructor", label: "Instructor" }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
    ...(user
      ? []
      : [
          { href: "/login", label: "Sign in" },
          { href: "/signup", label: "Sign up" },
        ]),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-white/10 dark:bg-zinc-950/80 dark:supports-[backdrop-filter]:bg-zinc-950/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-8">
          {/* Mobile menu toggle */}
          <MobileMenu items={mobileItems} />

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-brand-700 transition-colors hover:text-brand-800 dark:text-brand-200 dark:hover:text-brand-100"
            aria-label="Home"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-xs font-bold text-white">
              L
            </span>
            <span>LMS</span>
          </Link>

          {/* Primary nav (desktop) */}
          <nav className="hidden items-center gap-6 sm:flex">
            <NavLink href="/courses">Courses</NavLink>
            <NavLink href="/cohorts">Cohorts</NavLink>
            <NavLink href="/instructors">Instructors</NavLink>
            {user && <NavLink href="/dashboard">Dashboard</NavLink>}
            {isInstructor && <NavLink href="/instructor">Instructor</NavLink>}
            {isAdmin && <NavLink href="/admin">Admin</NavLink>}
          </nav>
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <NotificationBell userId={user.id} />
              <AccountMenu
                email={profile?.email ?? user.email}
                fullName={profile?.full_name}
                avatarUrl={profile?.avatar_url}
              />
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline-block">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/signup" className="hidden sm:inline-block">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
