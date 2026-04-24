"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteAccountAction,
  type DeleteAccountState,
} from "@/lib/actions/profiles";

const initialState: DeleteAccountState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="destructive" disabled={pending}>
      {pending ? "Deleting..." : "Delete my account"}
    </Button>
  );
}

export function DangerZone({ userEmail }: { userEmail: string | null }) {
  const [state, action] = useActionState(deleteAccountAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <p className="text-sm text-zinc-700 dark:text-zinc-300">
        Permanently delete your account, profile, enrolments, submissions,
        progress, certificates, orders and any uploads. This is not reversible.
      </p>

      {state.status === "error" && (
        <Alert variant="error">{state.message}</Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="confirm_email">
          Type <strong>{userEmail ?? "your email"}</strong> to confirm
        </Label>
        <Input
          id="confirm_email"
          name="confirm_email"
          type="email"
          autoComplete="off"
          required
        />
      </div>

      <SubmitButton />
    </form>
  );
}
