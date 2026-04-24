import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types";

export async function listCoupons(): Promise<Tables<"coupons">[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getCouponById(
  id: string,
): Promise<Tables<"coupons"> | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("coupons")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export type CouponValidation =
  | { valid: true; coupon: Tables<"coupons"> }
  | { valid: false; reason: string };

export async function validateCoupon(
  code: string,
): Promise<CouponValidation> {
  const trimmed = code.trim();
  if (!trimmed) return { valid: false, reason: "Enter a coupon code." };

  const supabase = await createClient();
  // Stored codes are uppercased (see createCouponAction); exact match is faster + safer than ilike.
  const { data: coupon } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", trimmed.toUpperCase())
    .maybeSingle();

  if (!coupon) return { valid: false, reason: "Coupon not found." };
  if (!coupon.is_active) {
    return { valid: false, reason: "This coupon isn't active." };
  }
  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return { valid: false, reason: "This coupon isn't active yet." };
  }
  if (coupon.ends_at && new Date(coupon.ends_at) < now) {
    return { valid: false, reason: "This coupon has expired." };
  }
  if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses) {
    return { valid: false, reason: "This coupon has reached its limit." };
  }
  return { valid: true, coupon };
}
