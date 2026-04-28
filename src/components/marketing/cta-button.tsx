import Link from "next/link";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

interface CTAButtonProps {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-accent-400 text-brand-900 hover:bg-accent-300 active:bg-accent-500 shadow-sm",
  secondary:
    "border-2 border-brand-600 bg-white text-brand-700 hover:bg-brand-50",
  ghost: "text-brand-700 hover:bg-brand-50",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-8 text-base",
};

export function CTAButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: CTAButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-semibold tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </Link>
  );
}
