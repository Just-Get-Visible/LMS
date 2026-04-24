"use server";

import { revalidatePath } from "next/cache";

import { isAdmin } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/user";
import { isCohortInstructor } from "@/lib/data/enrolments";
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert } from "@/types";

export type CohortInstructorActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

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

export async function addCohortInstructorAction(
  _prev: CohortInstructorActionState,
  formData: FormData,
): Promise<CohortInstructorActionState> {
  const cohortId = nullableString(formData.get("cohort_id"));
  const email = nullableString(formData.get("email"));
  const role = nullableString(formData.get("role")) ?? "mentor";

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

  const insert: TablesInsert<"cohort_instructors"> = {
    cohort_id: cohortId,
    user_id: profile.id,
    role,
  };

  const { error } = await supabase
    .from("cohort_instructors")
    .upsert(insert, { onConflict: "cohort_id,user_id" });

  if (error) return { status: "error", message: error.message };

  revalidatePath(`/instructor/cohorts/${cohortId}`);
  return { status: "success", message: `Added ${email} as ${role}.` };
}

export async function removeCohortInstructorAction(
  cohortId: string,
  linkId: string,
): Promise<void> {
  const user = await requireUser();
  await assertCanManageCohort(user.id, cohortId);

  const supabase = await createClient();
  await supabase.from("cohort_instructors").delete().eq("id", linkId);

  revalidatePath(`/instructor/cohorts/${cohortId}`);
}
