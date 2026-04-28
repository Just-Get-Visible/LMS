import { cn } from "@/lib/utils";

interface SectionProps {
  id?: string;
  className?: string;
  innerClassName?: string;
  pattern?: "light" | "dark";
  children: React.ReactNode;
}

export function Section({
  id,
  className,
  innerClassName,
  pattern,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative py-24 sm:py-32",
        pattern && "overflow-hidden",
        className,
      )}
    >
      {pattern === "light" && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(rgba(0,52,101,0.6)_1px,transparent_1px)] [background-size:22px_22px]"
        />
      )}
      {pattern === "dark" && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:22px_22px]"
        />
      )}
      <div className={cn("relative mx-auto max-w-6xl px-6", innerClassName)}>
        {children}
      </div>
    </section>
  );
}

export function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-md bg-accent-400 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-900">
      {children}
    </span>
  );
}

export function SectionHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "text-3xl font-extrabold leading-[1.1] tracking-tight text-brand-900 sm:text-4xl md:text-5xl",
        className,
      )}
    >
      {children}
    </h2>
  );
}
