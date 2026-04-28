import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  className,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-7 transition-colors hover:border-brand-600",
        className,
      )}
    >
      <div className="text-2xl leading-none" aria-hidden>
        {icon}
      </div>
      <h3 className="mt-5 text-lg font-bold tracking-tight text-brand-900">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600">
        {description}
      </p>
    </div>
  );
}
