"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { OrderSummary } from "@/components/checkout/order-summary";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  checkoutAction,
  type CheckoutItemKind,
  type CheckoutState,
} from "@/lib/actions/orders";
import { calculatePricing } from "@/lib/pricing";

export interface CheckoutItem {
  kind: CheckoutItemKind;
  id: string;
  title: string;
  price_amount: number | null;
  currency_code: string | null;
}

interface Props {
  item: CheckoutItem;
  defaultEmail?: string;
}

function makeInitialPricing(props: Props) {
  return calculatePricing(
    Number(props.item.price_amount ?? 0),
    props.item.currency_code ?? "GBP",
    null,
  );
}

function makeInitialState(props: Props): CheckoutState {
  return {
    status: "ready",
    pricing: makeInitialPricing(props),
    appliedCoupon: null,
  };
}

function ApplyButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      name="intent"
      value="apply"
      size="md"
      variant="secondary"
      disabled={pending}
    >
      {pending ? "Applying..." : "Apply"}
    </Button>
  );
}

function PayButton({ total, currency }: { total: number; currency: string }) {
  const { pending } = useFormStatus();
  const label = total === 0 ? "Enrol for free" : `Pay (simulated)`;
  return (
    <Button
      type="submit"
      name="intent"
      value="pay"
      disabled={pending}
      className="w-full"
    >
      {pending
        ? "Processing..."
        : `${label} · ${new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency,
          }).format(total)}`}
    </Button>
  );
}

export function CheckoutForm(props: Props) {
  const [state, action] = useActionState(checkoutAction, makeInitialState(props));

  const pricing =
    state.status === "ready" ? state.pricing : makeInitialPricing(props);
  const appliedCoupon =
    state.status === "ready" ? state.appliedCoupon : null;

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="item_kind" value={props.item.kind} />
      <input type="hidden" name="item_id" value={props.item.id} />

      {state.status === "error" && (
        <Alert variant="error">{state.message}</Alert>
      )}
      {state.status === "ready" && state.info && (
        <Alert variant="success">{state.info}</Alert>
      )}
      {state.status === "ready" && state.couponError && (
        <Alert variant="error">{state.couponError}</Alert>
      )}

      <fieldset className="space-y-3 rounded-md border border-black/10 p-4 dark:border-white/10">
        <legend className="px-1 text-sm font-medium">Coupon</legend>
        <div className="flex gap-2">
          <Input
            name="coupon_code"
            placeholder="Enter code"
            defaultValue={appliedCoupon?.code ?? ""}
            className="flex-1 uppercase"
          />
          <ApplyButton />
        </div>
      </fieldset>

      <fieldset className="space-y-3 rounded-md border border-black/10 p-4 dark:border-white/10">
        <legend className="px-1 text-sm font-medium">Billing</legend>
        <div className="space-y-2">
          <Label htmlFor="billing_name">
            Full name <span className="text-red-600">*</span>
          </Label>
          <Input id="billing_name" name="billing_name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="billing_email">
            Email <span className="text-red-600">*</span>
          </Label>
          <Input
            id="billing_email"
            name="billing_email"
            type="email"
            defaultValue={props.defaultEmail}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="billing_country_code">Country code</Label>
          <Input
            id="billing_country_code"
            name="billing_country_code"
            placeholder="GB"
            maxLength={3}
          />
        </div>
      </fieldset>

      <OrderSummary
        pricing={pricing}
        appliedCouponCode={appliedCoupon?.code ?? null}
      />

      <PayButton total={pricing.total} currency={pricing.currency} />

      <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
        This is a simulated payment. No real charge is made.
      </p>
    </form>
  );
}
