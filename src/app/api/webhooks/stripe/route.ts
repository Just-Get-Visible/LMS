import { NextResponse } from "next/server";
import type Stripe from "stripe";

import {
  notifyCohortEnrolment,
  notifyCourseEnrolment,
} from "@/lib/notifications/fanout";
import { getStripe } from "@/lib/stripe/client";
import { getAdminSupabase } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return new NextResponse("Stripe not configured", { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return new NextResponse("Missing signature", { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return new NextResponse(`Invalid signature: ${msg}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    await handleCheckoutCompleted(event);
  } else if (event.type === "charge.refunded") {
    await handleChargeRefunded(event);
  }

  return new NextResponse("ok", { status: 200 });
}

function extractPaymentIntentId(
  pi: string | Stripe.PaymentIntent | null | undefined,
): string | null {
  if (!pi) return null;
  return typeof pi === "string" ? pi : pi.id;
}

async function handleCheckoutCompleted(
  event: Stripe.Event & { data: { object: Stripe.Checkout.Session } },
): Promise<void> {
  const session = event.data.object;
  const orderId = session.metadata?.order_id;
  if (!orderId) return;

  const supabase = getAdminSupabase();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return;
  if (order.payment_status === "paid") return; // idempotent

  const paymentIntentId = extractPaymentIntentId(session.payment_intent);

  // Mark order paid. Store payment_intent in provider_reference (used for
  // refunds + charge.refunded webhook lookup); session_id moves to metadata.
  const baseMeta =
    order.metadata && typeof order.metadata === "object"
      ? (order.metadata as Record<string, unknown>)
      : {};
  await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      paid_at: new Date().toISOString(),
      provider_reference: paymentIntentId ?? session.id,
      metadata: {
        ...baseMeta,
        stripe_session_id: session.id,
        stripe_payment_intent: paymentIntentId,
      } as Json,
    })
    .eq("id", orderId);

  // Insert enrolment
  if (order.course_id) {
    await supabase.from("course_enrolments").upsert(
      {
        user_id: order.user_id,
        course_id: order.course_id,
        status: "active",
        source: "stripe",
        order_id: orderId,
      },
      { onConflict: "course_id,user_id" },
    );
    await notifyCourseEnrolment(order.user_id, order.course_id);
  } else if (order.cohort_id) {
    await supabase.from("cohort_enrolments").upsert(
      {
        user_id: order.user_id,
        cohort_id: order.cohort_id,
        status: "active",
      },
      { onConflict: "cohort_id,user_id" },
    );
    await notifyCohortEnrolment(order.user_id, order.cohort_id);
  }

  // Bump coupon usage on successful conversion
  if (order.coupon_id) {
    const { data: coupon } = await supabase
      .from("coupons")
      .select("used_count")
      .eq("id", order.coupon_id)
      .maybeSingle();
    if (coupon) {
      await supabase
        .from("coupons")
        .update({ used_count: (coupon.used_count ?? 0) + 1 })
        .eq("id", order.coupon_id);
    }
  }

  // Audit log
  await supabase.from("payment_events").insert({
    order_id: orderId,
    provider: "stripe",
    event_type: event.type,
    provider_event_id: event.id,
    payload: session as unknown as Json,
  });
}

async function handleChargeRefunded(
  event: Stripe.Event & { data: { object: Stripe.Charge } },
): Promise<void> {
  const charge = event.data.object;
  const paymentIntentId = extractPaymentIntentId(charge.payment_intent);
  if (!paymentIntentId) return;

  const supabase = getAdminSupabase();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("provider_reference", paymentIntentId)
    .maybeSingle();

  if (!order) return;
  if (order.payment_status === "refunded") return; // idempotent

  await supabase
    .from("orders")
    .update({
      payment_status: "refunded",
      refunded_at: new Date().toISOString(),
    })
    .eq("id", order.id);

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

  await supabase.from("payment_events").insert({
    order_id: order.id,
    provider: "stripe",
    event_type: event.type,
    provider_event_id: event.id,
    payload: charge as unknown as Json,
  });
}
