"use server";

import { revalidatePath } from "next/cache";

import { isAdmin } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/user";
import { isCourseInstructor } from "@/lib/data/enrolments";
import { notifyCourseEnrolment } from "@/lib/notifications/fanout";
import { createClient } from "@/lib/supabase/server";
import type { Enums, TablesInsert } from "@/types";

export type CourseEnrolmentActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const VALID_STATUS: Enums<"enrolment_status">[] = [
  "pending",
  "active",
  "cancelled",
  "completed",
  "refunded",
  "expired",
];

function pickEnrolmentStatus(
  v: FormDataEntryValue | null,
): Enums<"enrolment_status"> {
  return VALID_STATUS.includes(v as Enums<"enrolment_status">)
    ? (v as Enums<"enrolment_status">)
    : "active";
}

function nullableString(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

async function assertCanManageCourse(userId: string, courseId: string) {
  const ok =
    (await isCourseInstructor(userId, courseId)) || (await isAdmin(userId));
  if (!ok) {
    throw new Error("You don't have permission to manage this course.");
  }
}

// Admin / instructor manually enrols a student by email — no order, no
// payment. `source` is recorded as "admin" so revenue analytics can
// distinguish comp grants from real purchases.
export async function addCourseEnrolmentAction(
  _prev: CourseEnrolmentActionState,
  formData: FormData,
): Promise<CourseEnrolmentActionState> {
  const courseId = nullableString(formData.get("course_id"));
  const email = nullableString(formData.get("email"));
  const status = pickEnrolmentStatus(formData.get("status"));

  if (!courseId || !email) {
    return { status: "error", message: "Course and email are required." };
  }

  const user = await requireUser();
  await assertCanManageCourse(user.id, courseId);

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .maybeSingle();

  if (!profile) {
    return {
      status: "error",
      message: `No user found with email ${email}. They need an account first.`,
    };
  }

  const insert: TablesInsert<"course_enrolments"> = {
    course_id: courseId,
    user_id: profile.id,
    status,
    source: "admin",
  };

  const { error } = await supabase.from("course_enrolments").insert(insert);

  if (error) {
    if (error.code === "23505") {
      return {
        status: "error",
        message: "User is already enrolled in this course.",
      };
    }
    return { status: "error", message: error.message };
  }

  if (status === "active") {
    await notifyCourseEnrolment(profile.id, courseId);
  }

  revalidatePath(`/instructor/courses/${courseId}`);
  revalidatePath("/dashboard");
  return { status: "success", message: `Enrolled ${email}.` };
}

export async function updateCourseEnrolmentStatusAction(
  courseId: string,
  enrolmentId: string,
  formData: FormData,
): Promise<void> {
  const user = await requireUser();
  await assertCanManageCourse(user.id, courseId);

  const status = pickEnrolmentStatus(formData.get("status"));

  const supabase = await createClient();
  await supabase
    .from("course_enrolments")
    .update({ status })
    .eq("id", enrolmentId);

  revalidatePath(`/instructor/courses/${courseId}`);
}

export async function removeCourseEnrolmentAction(
  courseId: string,
  enrolmentId: string,
): Promise<void> {
  const user = await requireUser();
  await assertCanManageCourse(user.id, courseId);

  const supabase = await createClient();
  await supabase.from("course_enrolments").delete().eq("id", enrolmentId);

  revalidatePath(`/instructor/courses/${courseId}`);
}
