"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface StickyMobileCTAProps {
  href: string;
  label: string;
  watchSelector?: string;
}

export function StickyMobileCTA({
  href,
  label,
  watchSelector = "header, section:first-of-type",
}: StickyMobileCTAProps) {
  const [visible, setVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const target = document.querySelector(watchSelector);
    if (!target) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0 },
    );
    observerRef.current.observe(target);
    return () => observerRef.current?.disconnect();
  }, [watchSelector]);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.18)] backdrop-blur transition-transform duration-300 lg:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!visible}
    >
      <Link
        href={href}
        tabIndex={visible ? 0 : -1}
        className="flex h-12 w-full items-center justify-center gap-1.5 rounded-md bg-accent-400 px-6 text-base font-bold tracking-tight text-brand-900 shadow-sm transition-colors hover:bg-accent-300 active:bg-accent-500"
      >
        {label}
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
