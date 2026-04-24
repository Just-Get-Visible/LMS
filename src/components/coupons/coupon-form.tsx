"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createCouponAction,
  updateCouponAction,
  type CouponActionState,
  type CouponFieldErrors,
} from "@/lib/actions/coupons";
import type { Tables } from "@/types";

const initialState: CouponActionState = { status: "idle" };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : label}
    </Button>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-600 dark:text-red-400">{message}</p>;
}

function toDateTimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function CouponCreateForm() {
  const [state, action] = useActionState(createCouponAction, initialState);
  return (
    <CouponFormBody
      action={action}
      state={state}
      submitLabel="Create coupon"
    />
  );
}

export function CouponEditForm({ coupon }: { coupon: Tables<"coupons"> }) {
  const [state, action] = useActionState(updateCouponAction, initialState);
  return (
    <CouponFormBody
      action={action}
      state={state}
      submitLabel="Save coupon"
      coupon={coupon}
    />
  );
}

function CouponFormBody({
  action,
  state,
  submitLabel,
  coupon,
}: {
  action: (formData: FormData) => void;
  state: CouponActionState;
  submitLabel: string;
  coupon?: Tables<"coupons">;
}) {
  const fieldErrors: CouponFieldErrors =
    state.status === "error" ? state.fieldErrors ?? {} : {};

  return (
    <form action={action} className="space-y-5">
      {coupon && <input type="hidden" name="coupon_id" value={coupon.id} />}

      {state.status === "error" && (
        <Alert variant="error">{state.message}</Alert>
      )}
      {state.status === "success" && (
        <Alert variant="success">{state.message}</Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="code">
            Code <span className="text-red-600">*</span>
          </Label>
          <Input
            id="code"
            name="code"
            required
            defaultValue={coupon?.code}
            placeholder="WELCOME10"
            className="uppercase"
          />
          <FieldError message={fieldErrors.code} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="coupon_type">
            Type <span className="text-red-600">*</span>
          </Label>
          <select
            id="coupon_type"
            name="coupon_type"
            required
            defaultValue={coupon?.coupon_type ?? "percentage"}
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <option value="percentage">Percentage</option>
            <option value="fixed_amount">Fixed amount</option>
          </select>
          <FieldError message={fieldErrors.coupon_type} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={coupon?.description ?? ""}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="value_amount">
            Value <span className="text-red-600">*</span>
          </Label>
          <Input
            id="value_amount"
            name="value_amount"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={coupon?.value_amount?.toString() ?? ""}
          />
          <FieldError message={fieldErrors.value_amount} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency_code">Currency</Label>
          <Input
            id="currency_code"
            name="currency_code"
            defaultValue={coupon?.currency_code ?? "GBP"}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max_uses">Max uses</Label>
          <Input
            id="max_uses"
            name="max_uses"
            type="number"
            min={1}
            placeholder="Unlimited"
            defaultValue={coupon?.max_uses?.toString() ?? ""}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="starts_at">Starts at</Label>
          <Input
            id="starts_at"
            name="starts_at"
            type="datetime-local"
            defaultValue={toDateTimeLocal(coupon?.starts_at)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ends_at">Ends at</Label>
          <Input
            id="ends_at"
            name="ends_at"
            type="datetime-local"
            defaultValue={toDateTimeLocal(coupon?.ends_at)}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={coupon?.is_active ?? true}
          className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
        />
        <span>Active</span>
      </label>

      <SubmitButton label={submitLabel} />
    </form>
  );
}
