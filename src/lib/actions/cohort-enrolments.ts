"use server";

import { revalidatePath } from "next/cache";

import { isAdmin } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/user";
import { isCohortInstructor } from "@/lib/data/enrolments";
import { notifyCohortEnrolment } from "@/lib/notifications/fanout";
import { createClient } from "@/lib/supabase/server";
import type { Enums, TablesInsert } from "@/types";

export type CohortEnrolmentActionState =
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

async function assertCanManageCohort(userId: string, cohortId: string) {
  const ok =
    (await isCohortInstructor(userId, cohortId)) || (await isAdmin(userId));
  if (!ok) throw new Error("You don't have permission to manage this cohort.");
}

export async function addCohortEnrolmentAction(
  _prev: CohortEnrolmentActionState,
  formData: FormData,
): Promise<CohortEnrolmentActionState> {
  const cohortId = nullableString(formData.get("cohort_id"));
  const email = nullableString(formData.get("email"));
  const status = pickEnrolmentStatus(formData.get("status"));

  if (!cohortId || !email) {
    return { status: "error", message: "Cohort and email are required." };
  }

  const user = await requireUser();
  await assertCanManageCohort(user.id, cohortId);

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .maybeSingle();

  if (!profile) {
    return {
      status: "error",
      message: `No user found with email ${email}.`,
    };
  }

  const insert: TablesInsert<"cohort_enrolments"> = {
    cohort_id: cohortId,
    user_id: profile.id,
    status,
  };

  const { error } = await supabase.from("cohort_enrolments").insert(insert);

  if (error) {
    if (error.code === "23505") {
      return {
        status: "error",
        message: "User is already enrolled in this cohort.",
      };
    }
    return { status: "error", message: error.message };
  }

  if (status === "active") {
    await notifyCohortEnrolment(profile.id, cohortId);
  }

  revalidatePath(`/instructor/cohorts/${cohortId}`);
  revalidatePath("/dashboard");
  return { status: "success", message: `Enrolled ${email}.` };
}

export async function updateCohortEnrolmentStatusAction(
  cohortId: string,
  enrolmentId: string,
  formData: FormData,
): Promise<void> {
  const user = await requireUser();
  await assertCanManageCohort(user.id, cohortId);

  const status = pickEnrolmentStatus(formData.get("status"));

  const supabase = await createClient();
  await supabase
    .from("cohort_enrolments")
    .update({ status })
    .eq("id", enrolmentId);

  revalidatePath(`/instructor/cohorts/${cohortId}`);
}

export async function removeCohortEnrolmentAction(
  cohortId: string,
  enrolmentId: string,
): Promise<void> {
  const user = await requireUser();
  await assertCanManageCohort(user.id, cohortId);

  const supabase = await createClient();
  await supabase.from("cohort_enrolments").delete().eq("id", enrolmentId);

  revalidatePath(`/instructor/cohorts/${cohortId}`);
}
