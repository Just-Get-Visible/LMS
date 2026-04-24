"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  setEmailPreferencesAction,
  type EmailPreferencesActionState,
} from "@/lib/actions/profiles";
import {
  EMAIL_CATEGORIES,
  EMAIL_CATEGORY_LABELS,
  type EmailPreferences,
} from "@/lib/email/preferences";

const initialState: EmailPreferencesActionState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save preferences"}
    </Button>
  );
}

export function EmailPreferencesForm({
  defaults,
}: {
  defaults: EmailPreferences;
}) {
  const [state, action] = useActionState(
    setEmailPreferencesAction,
    initialState,
  );

  return (
    <form action={action} className="space-y-4">
      {state.status === "error" && (
        <Alert variant="error">{state.message}</Alert>
      )}
      {state.status === "success" && (
        <Alert variant="success">{state.message}</Alert>
      )}

      <fieldset className="space-y-3">
        {EMAIL_CATEGORIES.map((cat) => (
          <label
            key={cat}
            className="flex items-start gap-3 rounded-md border border-black/10 p-3 text-sm dark:border-white/10"
          >
            <input
              type="checkbox"
              name={cat}
              defaultChecked={defaults[cat]}
              className="mt-0.5 h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
            />
            <span>{EMAIL_CATEGORY_LABELS[cat]}</span>
          </label>
        ))}
      </fieldset>

      <SubmitButton />
    </form>
  );
}
