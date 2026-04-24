"use server";

import { revalidatePath } from "next/cache";

import { isAdmin } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/user";
import { isCourseInstructor } from "@/lib/data/enrolments";
import { createClient } from "@/lib/supabase/server";

export type LandingPageActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

// Shape mirrors LandingPageData in components/courses/course-landing-page.
// Kept as `unknown` validation here — admin-only writes, no XSS risk in
// the renderer (React escapes), so we just need shape sanity.
function parseLandingPayload(raw: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

// Strip empty strings / empty arrays so the JSONB stays clean.
function clean<T>(value: T): T | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? undefined : (trimmed as unknown as T);
  }
  if (Array.isArray(value)) {
    const filtered = value
      .map((v) => clean(v))
      .filter((v) => v !== undefined && v !== "");
    return filtered.length === 0 ? undefined : (filtered as unknown as T);
  }
  if (value && typeof value === "object") {
    const obj: Record<string, unknown> = {};
    let any = false;
    for (const [k, v] of Object.entries(value)) {
      const c = clean(v);
      if (c !== undefined) {
        obj[k] = c;
        any = true;
      }
    }
    return any ? (obj as unknown as T) : undefined;
  }
  return value;
}

export async function updateLandingPageAction(
  courseId: string,
  _prev: LandingPageActionState,
  formData: FormData,
): Promise<LandingPageActionState> {
  const user = await requireUser();
  const canEdit =
    (await isCourseInstructor(user.id, courseId)) || (await isAdmin(user.id));
  if (!canEdit) return { status: "error", message: "Access denied." };

  const raw = String(formData.get("payload") ?? "");
  const parsed = parseLandingPayload(raw);
  if (!parsed) {
    return { status: "error", message: "Invalid landing page data." };
  }

  const cleaned = clean(parsed) ?? {};
  // `published` is a real boolean, preserve it explicitly even if false.
  if (typeof parsed.published === "boolean") {
    (cleaned as Record<string, unknown>).published = parsed.published;
  }

  const supabase = await createClient();
  // landing_page column was added in migration 0002; generated types
  // haven't been regenerated yet, so cast the payload to bypass the
  // strict excess-property check.
  const { error } = await supabase
    .from("courses")
    .update({ landing_page: cleaned } as never)
    .eq("id", courseId);

  if (error) return { status: "error", message: error.message };

  revalidatePath(`/instructor/courses/${courseId}`);
  revalidatePath("/", "layout");
  return { status: "success", message: "Landing page saved." };
}
