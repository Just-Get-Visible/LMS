"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  updateProfileAction,
  type ProfileActionState,
  type ProfileFieldErrors,
} from "@/lib/actions/profiles";
import type { Tables } from "@/types";

const initialState: ProfileActionState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save changes"}
    </Button>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-600 dark:text-red-400">{message}</p>;
}

export function ProfileForm({ profile }: { profile: Tables<"profiles"> }) {
  const [state, action] = useActionState(updateProfileAction, initialState);
  const fieldErrors: ProfileFieldErrors =
    state.status === "error" ? state.fieldErrors ?? {} : {};

  return (
    <form action={action} className="space-y-6">
      {state.status === "error" && (
        <Alert variant="error">{state.message}</Alert>
      )}
      {state.status === "success" && (
        <Alert variant="success">{state.message}</Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="first_name">First name</Label>
          <Input
            id="first_name"
            name="first_name"
            defaultValue={profile.first_name ?? ""}
          />
          <FieldError message={fieldErrors.first_name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last name</Label>
          <Input
            id="last_name"
            name="last_name"
            defaultValue={profile.last_name ?? ""}
          />
          <FieldError message={fieldErrors.last_name} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="full_name">Full name</Label>
        <Input
          id="full_name"
          name="full_name"
          defaultValue={profile.full_name ?? ""}
        />
        <FieldError message={fieldErrors.full_name} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={profile.phone ?? ""}
          />
          <FieldError message={fieldErrors.phone} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Input
            id="timezone"
            name="timezone"
            placeholder="Europe/London"
            defaultValue={profile.timezone ?? ""}
          />
          <FieldError message={fieldErrors.timezone} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="headline">Headline</Label>
        <Input
          id="headline"
          name="headline"
          placeholder="One-line description"
          defaultValue={profile.headline ?? ""}
        />
        <FieldError message={fieldErrors.headline} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={profile.bio ?? ""}
        />
        <FieldError message={fieldErrors.bio} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatar_url">Avatar</Label>
        {profile.avatar_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt=""
            className="h-16 w-16 rounded-full border border-black/10 object-cover dark:border-white/10"
          />
        )}
        <Input
          id="avatar_url"
          name="avatar_url"
          type="url"
          placeholder="Paste a URL or upload below"
          defaultValue={profile.avatar_url ?? ""}
        />
        <input
          id="avatar_file"
          name="avatar_file"
          type="file"
          accept="image/*"
          className="block w-full text-sm text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-900 hover:file:bg-zinc-200 dark:text-zinc-300 dark:file:bg-zinc-800 dark:file:text-zinc-100 dark:hover:file:bg-zinc-700"
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Uploading a file overrides the URL.
        </p>
        <FieldError message={fieldErrors.avatar_url} />
      </div>

      <SubmitButton />
    </form>
  );
}
