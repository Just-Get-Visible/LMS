"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";

import { cn } from "@/lib/utils";

interface Props {
  tag: string;
  size?: "sm" | "md";
  className?: string;
}

export function TagChip({ tag, size = "sm", className }: Props) {
  const router = useRouter();

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    // Chips often live inside a parent <Link> (e.g. course cards). We
    // intercept and navigate to the filter URL instead.
    event.stopPropagation();
    event.preventDefault();
    router.push(`/courses?tag=${encodeURIComponent(tag)}`);
  }

  const sizeClass =
    size === "md"
      ? "px-2.5 py-1 text-xs"
      : "px-2 py-0.5 text-[10px]";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Filter courses by tag: ${tag}`}
      className={cn(
        "rounded-full bg-zinc-100 font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700",
        sizeClass,
        className,
      )}
    >
      {tag}
    </button>
  );
}
