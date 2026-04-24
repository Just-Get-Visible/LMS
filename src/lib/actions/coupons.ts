"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import type { Enums, TablesInsert, TablesUpdate } from "@/types";

export type CouponFieldErrors = Partial<
  Record<"code" | "value_amount" | "coupon_type", string>
>;

export type CouponActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: CouponFieldErrors };

function nullableString(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

function nullableNumber(v: FormDataEntryValue | null): number | null {
  if (typeof v !== "string" || v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function bool(v: FormDataEntryValue | null): boolean {
  return v === "on" || v === "true";
}

function parseDateTimeLocal(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string" || v.trim() === "") return null;
  const date = new Date(v);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function pickType(v: FormDataEntryValue | null): Enums<"coupon_type"> | null {
  return v === "percentage" || v === "fixed_amount" ? v : null;
}

export async function createCouponAction(
  _prev: CouponActionState,
  formData: FormData,
): Promise<CouponActionState> {
  const user = await requireUser();
  await requireAdmin(user.id);

  const code = nullableString(formData.get("code"));
  const couponType = pickType(formData.get("coupon_type"));
  const value = nullableNumber(formData.get("value_amount"));

  const fieldErrors: CouponFieldErrors = {};
  if (!code) fieldErrors.code = "Code is required.";
  if (!couponType) fieldErrors.coupon_type = "Choose a type.";
  if (value == null || value < 0) fieldErrors.value_amount = "Enter a value.";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  const insert: TablesInsert<"coupons"> = {
    code: code!.toUpperCase(),
    description: nullableString(formData.get("description")),
    coupon_type: couponType!,
    value_amount: value!,
    currency_code: nullableString(formData.get("currency_code")) ?? "GBP",
    max_uses: nullableNumber(formData.get("max_uses")),
    starts_at: parseDateTimeLocal(formData.get("starts_at")),
    ends_at: parseDateTimeLocal(formData.get("ends_at")),
    is_active: bool(formData.get("is_active")),
    created_by: user.id,
  };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupons")
    .insert(insert)
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        status: "error",
        message: "Code already exists.",
        fieldErrors: { code: "Code already in use." },
      };
    }
    return { status: "error", message: error.message };
  }

  revalidatePath("/admin/coupons");
  redirect(`/admin/coupons/${data.id}`);
}

export async function updateCouponAction(
  _prev: CouponActionState,
  formData: FormData,
): Promise<CouponActionState> {
  const id = nullableString(formData.get("coupon_id"));
  if (!id) return { status: "error", message: "Missing coupon id." };

  const user = await requireUser();
  await requireAdmin(user.id);

  const code = nullableString(formData.get("code"));
  const couponType = pickType(formData.get("coupon_type"));
  const value = nullableNumber(formData.get("value_amount"));

  const fieldErrors: CouponFieldErrors = {};
  if (!code) fieldErrors.code = "Code is required.";
  if (!couponType) fieldErrors.coupon_type = "Choose a type.";
  if (value == null || value < 0) fieldErrors.value_amount = "Enter a value.";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  const update: TablesUpdate<"coupons"> = {
    code: code!.toUpperCase(),
    description: nullableString(formData.get("description")),
    coupon_type: couponType!,
    value_amount: value!,
    currency_code: nullableString(formData.get("currency_code")) ?? "GBP",
    max_uses: nullableNumber(formData.get("max_uses")),
    starts_at: parseDateTimeLocal(formData.get("starts_at")),
    ends_at: parseDateTimeLocal(formData.get("ends_at")),
    is_active: bool(formData.get("is_active")),
  };

  const supabase = await createClient();
  const { error } = await supabase.from("coupons").update(update).eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return {
        status: "error",
        message: "Code already exists.",
        fieldErrors: { code: "Code already in use." },
      };
    }
    return { status: "error", message: error.message };
  }

  revalidatePath(`/admin/coupons/${id}`);
  revalidatePath("/admin/coupons");
  return { status: "success", message: "Coupon saved." };
}

export async function deleteCouponAction(id: string): Promise<void> {
  const user = await requireUser();
  await requireAdmin(user.id);

  const supabase = await createClient();
  await supabase.from("coupons").delete().eq("id", id);

  revalidatePath("/admin/coupons");
  redirect("/admin/coupons");
}

export async function setCouponActiveAction(
  id: string,
  isActive: boolean,
): Promise<void> {
  const user = await requireUser();
  await requireAdmin(user.id);

  const supabase = await createClient();
  await supabase.from("coupons").update({ is_active: isActive }).eq("id", id);

  revalidatePath(`/admin/coupons/${id}`);
  revalidatePath("/admin/coupons");
}
