"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { logoutAction } from "@/lib/actions/auth";

interface Props {
  email: string | null | undefined;
  fullName: string | null | undefined;
  avatarUrl: string | null | undefined;
}

export function AccountMenu({ email, fullName, avatarUrl }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointer(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const initial = (fullName?.trim() || email || "?").slice(0, 1).toUpperCase();
  const displayName = fullName?.trim() || email || "Account";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-brand-50 text-sm font-semibold text-brand-700 ring-1 ring-inset ring-brand-100 transition-colors hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:bg-brand-900/40 dark:text-brand-200 dark:ring-brand-800"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          initial
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-lg border border-black/10 bg-white shadow-lg dark:border-white/10 dark:bg-zinc-950"
        >
          <div className="border-b border-black/5 px-4 py-3 dark:border-white/10">
            <p className="truncate text-sm font-medium">{displayName}</p>
            {email && fullName && (
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                {email}
              </p>
            )}
          </div>
          <div className="py-1">
            <MenuLink href="/dashboard" onClick={() => setOpen(false)}>
              Dashboard
            </MenuLink>
            <MenuLink
              href="/dashboard/profile"
              onClick={() => setOpen(false)}
            >
              Profile &amp; settings
            </MenuLink>
          </div>
          <form
            action={logoutAction}
            className="border-t border-black/5 dark:border-white/10"
          >
            <button
              type="submit"
              role="menuitem"
              className="block w-full px-4 py-2.5 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="block px-4 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
    >
      {children}
    </Link>
  );
}
