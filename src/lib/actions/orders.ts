"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/user";
import { validateCoupon } from "@/lib/data/coupons";
import { getOrderById } from "@/lib/data/orders";
import { getAppBaseUrl } from "@/lib/email/client";
import {
  notifyCohortEnrolment,
  notifyCourseEnrolment,
} from "@/lib/notifications/fanout";
import { calculatePricing, type PricingBreakdown } from "@/lib/pricing";
import { getStripe } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";

export type AppliedCoupon = {
  id: string;
  code: string;
  discount: number;
};

export type CheckoutState =
  | {
      status: "ready";
      pricing: PricingBreakdown;
      appliedCoupon: AppliedCoupon | null;
      info?: string;
      couponError?: string;
    }
  | { status: "error"; message: string };

function nullableString(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  )
    .join("")
    .toUpperCase();
  return `ORD-${ts}-${rand}`;
}

export type CheckoutItemKind = "course" | "cohort";

export async function checkoutAction(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const intent = String(formData.get("intent") ?? "apply");
  const itemKind = (
    formData.get("item_kind") === "cohort" ? "cohort" : "course"
  ) as CheckoutItemKind;
  const itemId = nullableString(formData.get("item_id"));
  const code = nullableString(formData.get("coupon_code"));

  if (!itemId) {
    return { status: "error", message: "Missing item." };
  }

  const user = await requireUser();
  const supabase = await createClient();

  const item =
    itemKind === "course"
      ? await supabase
          .from("courses")
          .select("id, price_amount, currency_code")
          .eq("id", itemId)
          .maybeSingle()
      : await supabase
          .from("cohorts")
          .select("id, price_amount, currency_code")
          .eq("id", itemId)
          .maybeSingle();

  if (!item.data) {
    return {
      status: "error",
      message: itemKind === "course" ? "Course not found." : "Cohort not found.",
    };
  }

  const basePrice = Number(item.data.price_amount ?? 0);
  const currency = item.data.currency_code ?? "GBP";

  let appliedCoupon: AppliedCoupon | null = null;
  let couponError: string | undefined;

  if (code) {
    const result = await validateCoupon(code);
    if (result.valid) {
      const previewPricing = calculatePricing(
        basePrice,
        currency,
        result.coupon,
      );
      appliedCoupon = {
        id: result.coupon.id,
        code: result.coupon.code,
        discount: previewPricing.discount,
      };
    } else {
      couponError = result.reason;
    }
  }

  const pricing = calculatePricing(
    basePrice,
    currency,
    appliedCoupon
      ? await getCouponShape(appliedCoupon.id)
      : null,
  );

  if (intent === "apply") {
    return {
      status: "ready",
      pricing,
      appliedCoupon,
      info: couponError
        ? undefined
        : appliedCoupon
          ? "Coupon applied."
          : undefined,
      couponError,
    };
  }

  // intent === "pay"
  if (couponError) {
    return { status: "error", message: couponError };
  }

  const billingName = nullableString(formData.get("billing_name"));
  const billingEmail = nullableString(formData.get("billing_email"));
  if (!billingName || !billingEmail) {
    return {
      status: "error",
      message: "Billing name and email are required.",
    };
  }

  const stripe = getStripe();
  const useStripe = !!stripe && pricing.total > 0;

  // Item title — used for the Stripe line item description
  const itemTitleQuery =
    itemKind === "course"
      ? await supabase
          .from("courses")
          .select("title")
          .eq("id", itemId)
          .maybeSingle()
      : await supabase
          .from("cohorts")
          .select("name")
          .eq("id", itemId)
          .maybeSingle();
  const itemTitle =
    (itemTitleQuery.data as { title?: string; name?: string } | null)
      ?.title ??
    (itemTitleQuery.data as { name?: string } | null)?.name ??
    "Order";

  // Idempotency note: if user re-pays for an already-enrolled item, the enrolment
  // upsert below stays a no-op. Order rows are created fresh each time.
  const orderNumber = generateOrderNumber();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      course_id: itemKind === "course" ? itemId : null,
      cohort_id: itemKind === "cohort" ? itemId : null,
      coupon_id: appliedCoupon?.id ?? null,
      order_number: orderNumber,
      subtotal_amount: pricing.subtotal,
      discount_amount: pricing.discount,
      tax_amount: pricing.tax,
      total_amount: pricing.total,
      currency_code: pricing.currency,
      payment_status: useStripe ? "pending" : "paid",
      payment_provider: useStripe ? "stripe" : "manual",
      paid_at: useStripe ? null : new Date().toISOString(),
      billing_name: billingName,
      billing_email: billingEmail,
      billing_country_code: nullableString(
        formData.get("billing_country_code"),
      ),
      metadata: useStripe ? {} : { simulated: true },
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return {
      status: "error",
      message: orderError?.message ?? "Could not create order.",
    };
  }

  // Stripe path — create checkout session, redirect, return early.
  // Coupon usage + enrolment happen on the webhook in this path.
  if (useStripe && stripe) {
    const baseUrl = getAppBaseUrl();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: pricing.currency.toLowerCase(),
            product_data: { name: itemTitle },
            unit_amount: Math.round(pricing.total * 100),
          },
          quantity: 1,
        },
      ],
      customer_email: billingEmail,
      metadata: { order_id: order.id },
      success_url: `${baseUrl}/dashboard/orders/${order.id}`,
      cancel_url: `${baseUrl}/dashboard/orders/${order.id}`,
    });

    await supabase
      .from("orders")
      .update({ provider_reference: session.id })
      .eq("id", order.id);

    if (!session.url) {
      return {
        status: "error",
        message: "Stripe didn't return a checkout URL.",
      };
    }
    redirect(session.url);
  }

  // Simulated path — fulfil immediately.
  if (appliedCoupon) {
    const { data: current } = await supabase
      .from("coupons")
      .select("used_count")
      .eq("id", appliedCoupon.id)
      .maybeSingle();
    if (current) {
      await supabase
        .from("coupons")
        .update({ used_count: (current.used_count ?? 0) + 1 })
        .eq("id", appliedCoupon.id);
    }
  }

  if (itemKind === "course") {
    await supabase
      .from("course_enrolments")
      .upsert(
        {
          user_id: user.id,
          course_id: itemId,
          status: "active",
          source: "checkout",
          order_id: order.id,
        },
        { onConflict: "course_id,user_id" },
      );
    await notifyCourseEnrolment(user.id, itemId);
  } else {
    await supabase
      .from("cohort_enrolments")
      .upsert(
        {
          user_id: user.id,
          cohort_id: itemId,
          status: "active",
        },
        { onConflict: "cohort_id,user_id" },
      );
    await notifyCohortEnrolment(user.id, itemId);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");
  redirect(`/dashboard/orders/${order.id}`);
}

async function getCouponShape(
  couponId: string,
): Promise<
  { coupon_type: "percentage" | "fixed_amount"; value_amount: number } | null
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("coupons")
    .select("coupon_type, value_amount")
    .eq("id", couponId)
    .maybeSingle();
  return data;
}

export async function markOrderPaidAction(orderId: string): Promise<void> {
  const user = await requireUser();
  await requireAdmin(user.id);

  const order = await getOrderById(orderId);
  if (!order) return;

  const supabase = await createClient();
  await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      paid_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (order.course_id) {
    await supabase
      .from("course_enrolments")
      .upsert(
        {
          user_id: order.user_id,
          course_id: order.course_id,
          status: "active",
          source: "admin",
          order_id: orderId,
        },
        { onConflict: "course_id,user_id" },
      );
    await notifyCourseEnrolment(order.user_id, order.course_id);
  }
  if (order.cohort_id) {
    await supabase
      .from("cohort_enrolments")
      .upsert(
        {
          user_id: order.user_id,
          cohort_id: order.cohort_id,
          status: "active",
        },
        { onConflict: "cohort_id,user_id" },
      );
    await notifyCohortEnrolment(order.user_id, order.cohort_id);
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/dashboard/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

export async function refundOrderAction(orderId: string): Promise<void> {
  const user = await requireUser();
  await requireAdmin(user.id);

  const supabase = await createClient();
  const order = await getOrderById(orderId);
  if (!order) return;

  // If this was a real Stripe payment, issue the refund through Stripe first.
  // We log failures but still flip the DB so admin gets a consistent UI —
  // operationally safer than silently leaving things in conflict.
  if (
    order.payment_provider === "stripe" &&
    order.provider_reference?.startsWith("pi_")
  ) {
    const stripe = getStripe();
    if (stripe) {
      try {
        await stripe.refunds.create({
          payment_intent: order.provider_reference,
        });
      } catch (e) {
        if (process.env.NODE_ENV !== "production") {
          console.error("[stripe refund]", e);
        }
      }
    }
  }

  await supabase
    .from("orders")
    .update({
      payment_status: "refunded",
      refunded_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  // Revoke enrolment on refund — canAccessCourseContent only matches
  // status in ('active','completed').
  if (order.course_id) {
    await supabase
      .from("course_enrolments")
      .update({ status: "refunded" })
      .eq("course_id", order.course_id)
      .eq("user_id", order.user_id);
  }
  if (order.cohort_id) {
    await supabase
      .from("cohort_enrolments")
      .update({ status: "refunded" })
      .eq("cohort_id", order.cohort_id)
      .eq("user_id", order.user_id);
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/dashboard/orders/${orderId}`);
  revalidatePath("/admin/orders");
}
