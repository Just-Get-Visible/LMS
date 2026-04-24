"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface Props {
  href: string;
  children: React.ReactNode;
  // When true, only an exact path match counts as active. Otherwise any
  // descendant path (e.g. /courses/foo for /courses) counts.
  exact?: boolean;
}

export function NavLink({ href, children, exact }: Props) {
  const pathname = usePathname();
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative inline-flex items-center px-1 text-sm transition-colors",
        isActive
          ? "font-medium text-brand-700 dark:text-brand-200"
          : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
      )}
    >
      {children}
      {isActive && (
        <span
          aria-hidden
          className="absolute -bottom-[18px] left-0 right-0 h-0.5 rounded-full bg-brand-500 dark:bg-brand-400"
        />
      )}
    </Link>
  );
}
