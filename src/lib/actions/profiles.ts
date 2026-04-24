"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/user";
import {
  EMAIL_CATEGORIES,
  type EmailCategory,
  mergeEmailPreferences,
} from "@/lib/email/preferences";
import { safeFileName } from "@/lib/forms";
import { STORAGE_BUCKETS } from "@/lib/storage/buckets";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { getPublicUrl, uploadFile } from "@/lib/storage/upload";
import { createClient } from "@/lib/supabase/server";
import type { TablesUpdate } from "@/types";

export type ProfileFieldErrors = Partial<
  Record<
    | "full_name"
    | "first_name"
    | "last_name"
    | "phone"
    | "bio"
    | "headline"
    | "timezone"
    | "avatar_url",
    string
  >
>;

export type ProfileActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: ProfileFieldErrors };

function nullableString(raw: FormDataEntryValue | null): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed === "" ? null : trimmed;
}

export async function updateProfileAction(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  let avatarUrl = nullableString(formData.get("avatar_url"));
  const avatarFile = formData.get("avatar_file");
  if (avatarFile instanceof File && avatarFile.size > 0) {
    const safeName = safeFileName(avatarFile.name);
    const path = `${user.id}/${Date.now()}_${safeName}`;
    const result = await uploadFile(
      STORAGE_BUCKETS.AVATARS,
      path,
      avatarFile,
      { upsert: true },
    );
    if (!result.ok) {
      return { status: "error", message: `Avatar upload failed: ${result.error}` };
    }
    avatarUrl = await getPublicUrl(STORAGE_BUCKETS.AVATARS, result.path);
  }

  const update: TablesUpdate<"profiles"> = {
    full_name: nullableString(formData.get("full_name")),
    first_name: nullableString(formData.get("first_name")),
    last_name: nullableString(formData.get("last_name")),
    phone: nullableString(formData.get("phone")),
    bio: nullableString(formData.get("bio")),
    headline: nullableString(formData.get("headline")),
    timezone: nullableString(formData.get("timezone")),
    avatar_url: avatarUrl,
  };

  const fieldErrors: ProfileFieldErrors = {};

  if (update.full_name && update.full_name.length > 200) {
    fieldErrors.full_name = "Name is too long.";
  }
  if (update.headline && update.headline.length > 200) {
    fieldErrors.headline = "Headline is too long.";
  }
  if (update.bio && update.bio.length > 2000) {
    fieldErrors.bio = "Bio is too long.";
  }
  if (update.phone && !/^[+0-9 ()\-]{4,}$/.test(update.phone)) {
    fieldErrors.phone = "Enter a valid phone number.";
  }
  if (update.avatar_url && !/^https?:\/\//i.test(update.avatar_url)) {
    fieldErrors.avatar_url = "Must start with http:// or https://";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", user.id);

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  revalidatePath("/", "layout");
  return { status: "success", message: "Profile updated." };
}

export type EmailPreferencesActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export async function setEmailPreferencesAction(
  _prev: EmailPreferencesActionState,
  formData: FormData,
): Promise<EmailPreferencesActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const next: Partial<Record<EmailCategory, boolean>> = {};
  for (const cat of EMAIL_CATEGORIES) {
    next[cat] = formData.get(cat) === "on";
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("metadata")
    .eq("id", user.id)
    .maybeSingle();

  const merged = mergeEmailPreferences(profile?.metadata ?? null, next);

  const { error } = await supabase
    .from("profiles")
    .update({ metadata: merged })
    .eq("id", user.id);

  if (error) return { status: "error", message: error.message };

  revalidatePath("/dashboard/profile");
  return { status: "success", message: "Email preferences saved." };
}

export type DeleteAccountState =
  | { status: "idle" }
  | { status: "error"; message: string };

export async function deleteAccountAction(
  _prev: DeleteAccountState,
  formData: FormData,
): Promise<DeleteAccountState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const confirm = nullableString(formData.get("confirm_email"));
  if (!confirm) {
    return {
      status: "error",
      message: "Type your email address to confirm.",
    };
  }
  if (
    !user.email ||
    confirm.trim().toLowerCase() !== user.email.trim().toLowerCase()
  ) {
    return { status: "error", message: "Email doesn't match your account." };
  }

  // Purge user-scoped storage objects BEFORE deleting the auth row — DB
  // cascade wipes the submission rows, after which we'd lose the storage
  // paths to clean up.
  await purgeUserStorage(user.id);

  // Delete from auth.users via service role. Cascades to profiles → enrolments
  // → progress → etc. via FK constraints in the base schema.
  try {
    const admin = getAdminSupabase();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) return { status: "error", message: error.message };
  } catch (e) {
    return {
      status: "error",
      message:
        e instanceof Error
          ? e.message
          : "Could not delete account. Contact support.",
    };
  }

  // Sign out current session.
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * Best-effort cleanup of storage objects scoped to a user. Failures are
 * logged in dev but never block account deletion — the auth row + DB
 * cascade is the source of truth for "user is gone."
 */
async function purgeUserStorage(userId: string): Promise<void> {
  const admin = getAdminSupabase();

  // Submission files — fetch paths from the table FIRST (before cascade).
  const { data: submissions } = await admin
    .from("assignment_submissions")
    .select("storage_bucket, storage_path")
    .eq("user_id", userId);

  const submissionPaths = (submissions ?? [])
    .filter(
      (s): s is { storage_bucket: string; storage_path: string } =>
        s.storage_bucket === STORAGE_BUCKETS.SUBMISSIONS &&
        typeof s.storage_path === "string" &&
        s.storage_path.length > 0,
    )
    .map((s) => s.storage_path);

  if (submissionPaths.length > 0) {
    const { error } = await admin.storage
      .from(STORAGE_BUCKETS.SUBMISSIONS)
      .remove(submissionPaths);
    if (error && process.env.NODE_ENV !== "production") {
      console.warn("[delete-account] submission purge:", error.message);
    }
  }

  // Avatar files — flat folder under userId/.
  const { data: avatarFiles } = await admin.storage
    .from(STORAGE_BUCKETS.AVATARS)
    .list(userId, { limit: 1000 });

  if (avatarFiles && avatarFiles.length > 0) {
    const paths = avatarFiles.map((f) => `${userId}/${f.name}`);
    const { error } = await admin.storage
      .from(STORAGE_BUCKETS.AVATARS)
      .remove(paths);
    if (error && process.env.NODE_ENV !== "production") {
      console.warn("[delete-account] avatar purge:", error.message);
    }
  }
}
