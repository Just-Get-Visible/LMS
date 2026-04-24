"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdmin, requireInstructor } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/user";
import { isCohortInstructor, isCourseInstructor } from "@/lib/data/enrolments";
import { createClient } from "@/lib/supabase/server";
import type { Enums, TablesInsert, TablesUpdate } from "@/types";

export type CohortFieldErrors = Partial<
  Record<"name" | "slug" | "course_id", string>
>;

export type CohortActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: CohortFieldErrors };

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

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const VALID_STATUS: Enums<"cohort_status">[] = [
  "draft",
  "open",
  "closed",
  "running",
  "completed",
  "cancelled",
];

function pickStatus(v: FormDataEntryValue | null): Enums<"cohort_status"> {
  return VALID_STATUS.includes(v as Enums<"cohort_status">)
    ? (v as Enums<"cohort_status">)
    : "draft";
}

async function assertCanManageCohort(userId: string, cohortId: string) {
  const ok =
    (await isCohortInstructor(userId, cohortId)) || (await isAdmin(userId));
  if (!ok) throw new Error("You don't have permission to manage this cohort.");
}

export async function createCohortAction(
  _prev: CohortActionState,
  formData: FormData,
): Promise<CohortActionState> {
  const user = await requireUser();
  await requireInstructor(user.id);

  const courseId = nullableString(formData.get("course_id"));
  const name = nullableString(formData.get("name"));
  const slugInput = nullableString(formData.get("slug"));
  const slug = slugInput ?? (name ? slugify(name) : null);

  const fieldErrors: CohortFieldErrors = {};
  if (!courseId) fieldErrors.course_id = "Choose a course.";
  if (!name) fieldErrors.name = "Name is required.";
  if (!slug) fieldErrors.slug = "Slug is required.";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  const canCreate =
    (await isCourseInstructor(user.id, courseId!)) || (await isAdmin(user.id));
  if (!canCreate) {
    return {
      status: "error",
      message: "You can only create cohorts for courses you instruct.",
    };
  }

  const insert: TablesInsert<"cohorts"> = {
    course_id: courseId!,
    name: name!,
    slug: slug!,
    status: "draft",
    description: nullableString(formData.get("description")),
    created_by: user.id,
  };

  const supabase = await createClient();
  const { data: cohort, error } = await supabase
    .from("cohorts")
    .insert(insert)
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        status: "error",
        message: "Slug already exists.",
        fieldErrors: { slug: "Already used by another cohort." },
      };
    }
    return { status: "error", message: error.message };
  }

  await supabase.from("cohort_instructors").upsert(
    { cohort_id: cohort.id, user_id: user.id, role: "lead" },
    { onConflict: "cohort_id,user_id" },
  );

  revalidatePath("/instructor/cohorts");
  redirect(`/instructor/cohorts/${cohort.id}`);
}

export async function updateCohortAction(
  _prev: CohortActionState,
  formData: FormData,
): Promise<CohortActionState> {
  const cohortId = nullableString(formData.get("cohort_id"));
  if (!cohortId) return { status: "error", message: "Missing cohort id." };

  const user = await requireUser();
  await assertCanManageCohort(user.id, cohortId);

  const name = nullableString(formData.get("name"));
  const slug = nullableString(formData.get("slug"));

  const fieldErrors: CohortFieldErrors = {};
  if (!name) fieldErrors.name = "Name is required.";
  if (!slug) fieldErrors.slug = "Slug is required.";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  const update: TablesUpdate<"cohorts"> = {
    name: name!,
    slug: slug!,
    description: nullableString(formData.get("description")),
    status: pickStatus(formData.get("status")),
    capacity: nullableNumber(formData.get("capacity")),
    waitlist_enabled: bool(formData.get("waitlist_enabled")),
    starts_at: parseDateTimeLocal(formData.get("starts_at")),
    ends_at: parseDateTimeLocal(formData.get("ends_at")),
    enrolment_opens_at: parseDateTimeLocal(formData.get("enrolment_opens_at")),
    enrolment_closes_at: parseDateTimeLocal(formData.get("enrolment_closes_at")),
    timezone: nullableString(formData.get("timezone")),
    live_session_frequency: nullableString(
      formData.get("live_session_frequency"),
    ),
    community_enabled: bool(formData.get("community_enabled")),
    price_amount: nullableNumber(formData.get("price_amount")),
    currency_code: nullableString(formData.get("currency_code")) ?? "GBP",
  };

  const supabase = await createClient();
  const { error } = await supabase
    .from("cohorts")
    .update(update)
    .eq("id", cohortId);

  if (error) {
    if (error.code === "23505") {
      return {
        status: "error",
        message: "Slug already exists.",
        fieldErrors: { slug: "Already used by another cohort." },
      };
    }
    return { status: "error", message: error.message };
  }

  revalidatePath(`/instructor/cohorts/${cohortId}`);
  revalidatePath("/instructor/cohorts");
  revalidatePath(`/dashboard/cohorts/${cohortId}`);
  return { status: "success", message: "Cohort saved." };
}

export async function setCohortStatusAction(
  cohortId: string,
  status: Enums<"cohort_status">,
): Promise<void> {
  const user = await requireUser();
  await assertCanManageCohort(user.id, cohortId);

  const supabase = await createClient();
  await supabase
    .from("cohorts")
    .update({ status })
    .eq("id", cohortId);

  revalidatePath(`/instructor/cohorts/${cohortId}`);
  revalidatePath("/instructor/cohorts");
}
