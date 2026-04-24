import { formatPrice } from "@/lib/format";
import type { PricingBreakdown } from "@/lib/pricing";

export function OrderSummary({
  pricing,
  appliedCouponCode,
}: {
  pricing: PricingBreakdown;
  appliedCouponCode?: string | null;
}) {
  return (
    <div className="space-y-2 rounded-md border border-black/10 bg-zinc-50 p-4 text-sm dark:border-white/10 dark:bg-zinc-900">
      <Row label="Subtotal">
        {formatPrice(pricing.subtotal, pricing.currency, false)}
      </Row>
      {pricing.discount > 0 && (
        <Row label={`Discount${appliedCouponCode ? ` (${appliedCouponCode})` : ""}`}>
          -{formatPrice(pricing.discount, pricing.currency, false)}
        </Row>
      )}
      {pricing.tax > 0 && (
        <Row label="Tax">{formatPrice(pricing.tax, pricing.currency, false)}</Row>
      )}
      <div className="mt-2 flex justify-between border-t border-black/10 pt-2 dark:border-white/10">
        <span className="font-semibold">Total</span>
        <span className="text-lg font-semibold tracking-tight">
          {formatPrice(pricing.total, pricing.currency, false)}
        </span>
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
      <span>{label}</span>
      <span className="font-medium text-zinc-800 dark:text-zinc-200">
        {children}
      </span>
    </div>
  );
}
