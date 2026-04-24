"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  exact?: boolean;
};

const STUDENT_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview", exact: true },
  { href: "/dashboard/cohorts", label: "Cohorts" },
  { href: "/dashboard/sessions", label: "Sessions" },
  { href: "/dashboard/assignments", label: "Assignments" },
  { href: "/dashboard/quizzes", label: "Quizzes" },
  { href: "/dashboard/discussions", label: "Discussions" },
  { href: "/dashboard/announcements", label: "Announcements" },
  { href: "/dashboard/certificates", label: "Certificates" },
  { href: "/dashboard/orders", label: "Orders" },
];

const INSTRUCTOR_ITEMS: NavItem[] = [
  { href: "/instructor", label: "Overview", exact: true },
  { href: "/instructor/courses", label: "Courses" },
  { href: "/instructor/cohorts", label: "Cohorts" },
  { href: "/instructor/sessions", label: "Sessions" },
  { href: "/instructor/assignments", label: "Assignments" },
  { href: "/instructor/quizzes", label: "Quizzes" },
  { href: "/instructor/announcements", label: "Announcements" },
];

const ADMIN_ITEMS: NavItem[] = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/coupons", label: "Coupons" },
];

export function SectionNav() {
  const pathname = usePathname();

  let items: NavItem[] | null = null;
  if (pathname.startsWith("/admin")) items = ADMIN_ITEMS;
  else if (pathname.startsWith("/instructor")) items = INSTRUCTOR_ITEMS;
  else if (pathname.startsWith("/dashboard")) items = STUDENT_ITEMS;

  if (!items) return null;

  return (
    <nav className="border-b border-black/10 bg-white dark:border-white/10 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl overflow-x-auto px-4">
        <ul className="flex gap-1 py-2">
          {items.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
