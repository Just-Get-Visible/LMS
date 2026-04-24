import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const variants = {
  neutral:
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  brand:
    "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200",
  accent:
    "bg-accent-100 text-brand-800 dark:bg-accent-300/20 dark:text-accent-200",
  success:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  warning:
    "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  danger:
    "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  outline:
    "border border-zinc-200 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300",
} as const;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "neutral", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  ),
);
Badge.displayName = "Badge";
