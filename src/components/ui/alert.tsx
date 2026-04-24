import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const variants = {
  info: {
    classes:
      "border-brand-200 bg-brand-50 text-brand-900 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-200",
    accent: "bg-brand-500 dark:bg-brand-400",
  },
  success: {
    classes:
      "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
    accent: "bg-emerald-500 dark:bg-emerald-400",
  },
  warning: {
    classes:
      "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
    accent: "bg-amber-500 dark:bg-amber-400",
  },
  error: {
    classes:
      "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200",
    accent: "bg-red-500 dark:bg-red-400",
  },
} as const;

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variants;
}

export function Alert({
  className,
  variant = "info",
  children,
  ...props
}: AlertProps) {
  const v = variants[variant];
  return (
    <div
      role="alert"
      className={cn(
        "relative overflow-hidden rounded-md border pl-4 pr-3 py-2.5 text-sm",
        v.classes,
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn("absolute inset-y-0 left-0 w-1", v.accent)}
      />
      {children}
    </div>
  );
}
