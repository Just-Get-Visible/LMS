import { CTAButton } from "@/components/marketing/cta-button";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  name: string;
  description: string;
  price: string;
  priceNote?: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  popular?: boolean;
  popularNote?: string;
}

export function PricingCard({
  name,
  description,
  price,
  priceNote,
  features,
  ctaLabel,
  ctaHref,
  popular = false,
  popularNote,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border p-8 transition-transform",
        popular
          ? "border-brand-600 bg-gradient-to-b from-white to-brand-50/60 shadow-[0_0_0_3px_var(--color-brand-600)] lg:scale-[1.04]"
          : "border-zinc-200 bg-white",
      )}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5">
          <span className="rounded-md bg-accent-400 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-900 shadow-sm">
            Most popular
          </span>
          {popularNote && (
            <span className="rounded-md bg-brand-900 px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-white/85 shadow-sm">
              {popularNote}
            </span>
          )}
        </div>
      )}
      <h3 className="text-xl font-bold tracking-tight text-brand-900">
        {name}
      </h3>
      <p className="mt-2 text-sm text-zinc-600">{description}</p>
      <div className="mt-6 flex items-baseline gap-2">
        <span className="text-4xl font-extrabold tracking-tight text-brand-900">
          {price}
        </span>
        {priceNote && (
          <span className="text-sm text-zinc-500">{priceNote}</span>
        )}
      </div>
      <ul className="mt-8 flex-1 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm text-zinc-700">
            <span
              className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent-400 text-brand-900"
              aria-hidden
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <CTAButton
        href={ctaHref}
        variant={popular ? "primary" : "secondary"}
        size="md"
        className="mt-8 w-full"
      >
        {ctaLabel}
      </CTAButton>
    </div>
  );
}
