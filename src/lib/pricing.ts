import type { Enums } from "@/types";

export type PricingBreakdown = {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
};

export type CouponShape = {
  coupon_type: Enums<"coupon_type">;
  value_amount: number;
};

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculatePricing(
  basePrice: number,
  currency: string,
  coupon: CouponShape | null,
): PricingBreakdown {
  const subtotal = Math.max(0, basePrice);
  let discount = 0;
  if (coupon) {
    if (coupon.coupon_type === "percentage") {
      discount = subtotal * (Number(coupon.value_amount) / 100);
    } else {
      discount = Number(coupon.value_amount);
    }
    discount = Math.min(subtotal, Math.max(0, discount));
  }
  const tax = 0;
  const total = Math.max(0, subtotal - discount + tax);
  return {
    subtotal: round(subtotal),
    discount: round(discount),
    tax: round(tax),
    total: round(total),
    currency,
  };
}
