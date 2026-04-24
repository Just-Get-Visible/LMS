"use server";

import { revalidatePath } from "next/cache";

import { isAdmin } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/user";
import {
  canAccessCourseContent,
  isCourseInstructor,
} from "@/lib/data/enrolments";
import { getAssignmentById } from "@/lib/data/assignments";
import { getInheritedUnlockTime } from "@/lib/data/drip";
import { notifySubmissionReviewed } from "@/lib/notifications/fanout";
import { createSignedDownloadUrl } from "@/lib/storage/signed-url";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/types";

const SUBMISSIONS_BUCKET = "submissions";

export type SubmissionActionState =
  | { status: "idle" }
  | { status: "success"; message: string; submitted: boolean }
  | { status: "error"; message: string };

const VALID_REVIEW_STATUS: Enums<"assignment_submission_status">[] = [
  "submitted",
  "reviewed",
  "returned",
  "passed",
  "failed",
];

function pickReviewStatus(
  v: FormDataEntryValue | null,
): Enums<"assignment_submission_status"> {
  return VALID_REVIEW_STATUS.includes(
    v as Enums<"assignment_submission_status">,
  )
    ? (v as Enums<"assignment_submission_status">)
    : "reviewed";
}

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

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function saveSubmissionAction(
  _prev: SubmissionActionState,
  formData: FormData,
): Promise<SubmissionActionState> {
  const user = await requireUser();

  const assignmentId = nullableString(formData.get("assignment_id"));
  if (!assignmentId) {
    return { status: "error", message: "Missing assignment id." };
  }

  const assignment = await getAssignmentById(assignmentId);
  if (!assignment) {
    return { status: "error", message: "Assignment not found." };
  }

  const canAccess = await canAccessCourseContent(user.id, assignment.course_id);
  if (!canAccess) {
    return { status: "error", message: "Access denied." };
  }

  const unlockAt = await getInheritedUnlockTime(user.id, assignment.lesson_id);
  if (unlockAt) {
    return {
      status: "error",
      message: "This assignment is not yet available.",
    };
  }

  const isLate =
    !!assignment.due_at && new Date() > new Date(assignment.due_at);
  const intent = String(formData.get("intent") ?? "draft");
  const wantsSubmit = intent === "submit";

  if (wantsSubmit && isLate && !assignment.allow_late_submissions) {
    return {
      status: "error",
      message: "Late submissions aren't allowed for this assignment.",
    };
  }

  const text = nullableString(formData.get("submission_text"));
  const file = formData.get("file");

  const supabase = await createClient();

  const { data: existingDraft } = await supabase
    .from("assignment_submissions")
    .select("id, storage_bucket, storage_path")
    .eq("assignment_id", assignmentId)
    .eq("user_id", user.id)
    .eq("status", "draft")
    .maybeSingle();

  let storage_bucket: string | null = existingDraft?.storage_bucket ?? null;
  let storage_path: string | null = existingDraft?.storage_path ?? null;

  if (file instanceof File && file.size > 0) {
    const safeName = safeFileName(file.name);
    const path = `${user.id}/${assignmentId}/${Date.now()}_${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from(SUBMISSIONS_BUCKET)
      .upload(path, file, {
        upsert: false,
        contentType: file.type || undefined,
      });

    if (uploadError) {
      return {
        status: "error",
        message: `Upload failed: ${uploadError.message}`,
      };
    }
    storage_bucket = SUBMISSIONS_BUCKET;
    storage_path = path;
  }

  const status: Enums<"assignment_submission_status"> = wantsSubmit
    ? "submitted"
    : "draft";
  const submittedAt = wantsSubmit ? new Date().toISOString() : null;

  const shouldUpdateDraft =
    existingDraft && (!wantsSubmit || !assignment.allow_multiple_submissions);

  if (shouldUpdateDraft) {
    const { error } = await supabase
      .from("assignment_submissions")
      .update({
        submission_text: text,
        storage_bucket,
        storage_path,
        status,
        submitted_at: submittedAt,
      })
      .eq("id", existingDraft.id);

    if (error) return { status: "error", message: error.message };
  } else {
    const { error } = await supabase.from("assignment_submissions").insert({
      assignment_id: assignmentId,
      user_id: user.id,
      submission_text: text,
      storage_bucket,
      storage_path,
      status,
      submitted_at: submittedAt,
    });

    if (error) return { status: "error", message: error.message };
  }

  revalidatePath(`/dashboard/assignments/${assignmentId}`);
  revalidatePath(`/instructor/assignments/${assignmentId}`);
  revalidatePath("/instructor");

  return {
    status: "success",
    message: wantsSubmit ? "Submitted." : "Draft saved.",
    submitted: wantsSubmit,
  };
}

export type ReviewActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export async function reviewSubmissionAction(
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const submissionId = nullableString(formData.get("submission_id"));
  if (!submissionId) {
    return { status: "error", message: "Missing submission id." };
  }

  const user = await requireUser();
  const supabase = await createClient();

  const { data: sub } = await supabase
    .from("assignment_submissions")
    .select("assignment_id")
    .eq("id", submissionId)
    .maybeSingle();

  if (!sub) return { status: "error", message: "Submission not found." };

  const assignment = await getAssignmentById(sub.assignment_id);
  if (!assignment) return { status: "error", message: "Assignment not found." };

  const canManage =
    (await isCourseInstructor(user.id, assignment.course_id)) ||
    (await isAdmin(user.id));
  if (!canManage) {
    return { status: "error", message: "You can't review this submission." };
  }

  const score = nullableNumber(formData.get("score"));
  const feedback = nullableString(formData.get("feedback"));
  const status = pickReviewStatus(formData.get("status"));

  const { error } = await supabase
    .from("assignment_submissions")
    .update({
      score,
      feedback,
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq("id", submissionId);

  if (error) return { status: "error", message: error.message };

  await notifySubmissionReviewed(submissionId);

  revalidatePath(`/instructor/assignments/${sub.assignment_id}`);
  revalidatePath(`/dashboard/assignments/${sub.assignment_id}`);
  return { status: "success", message: "Review saved." };
}

export async function bulkSetSubmissionStatusAction(
  assignmentId: string,
  submissionIds: string[],
  formData: FormData,
): Promise<void> {
  if (!assignmentId || submissionIds.length === 0) return;

  const user = await requireUser();
  const assignment = await getAssignmentById(assignmentId);
  if (!assignment) return;

  const canManage =
    (await isCourseInstructor(user.id, assignment.course_id)) ||
    (await isAdmin(user.id));
  if (!canManage) return;

  const status = pickReviewStatus(formData.get("status"));

  const supabase = await createClient();
  // Single UPDATE constrained to the assignment + ids — defence-in-depth
  // against ids that belong to other assignments.
  const { error } = await supabase
    .from("assignment_submissions")
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq("assignment_id", assignmentId)
    .in("id", submissionIds);

  if (error) return;

  for (const id of submissionIds) {
    await notifySubmissionReviewed(id);
  }

  revalidatePath(`/instructor/assignments/${assignmentId}`);
  revalidatePath(`/dashboard/assignments/${assignmentId}`);
}

export type SubmissionFileResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export async function getSubmissionFileUrl(
  submissionId: string,
): Promise<SubmissionFileResult> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: sub } = await supabase
    .from("assignment_submissions")
    .select(
      "user_id, assignment_id, storage_bucket, storage_path, file_url",
    )
    .eq("id", submissionId)
    .maybeSingle();

  if (!sub) return { ok: false, error: "Submission not found." };

  let canAccess =
    sub.user_id === user.id || (await isAdmin(user.id));
  if (!canAccess) {
    const assignment = await getAssignmentById(sub.assignment_id);
    if (assignment) {
      canAccess = await isCourseInstructor(user.id, assignment.course_id);
    }
  }

  if (!canAccess) return { ok: false, error: "Access denied." };

  if (sub.file_url) return { ok: true, url: sub.file_url };
  if (!sub.storage_bucket || !sub.storage_path) {
    return { ok: false, error: "No file attached." };
  }

  const url = await createSignedDownloadUrl(
    sub.storage_bucket,
    sub.storage_path,
    300,
  );
  if (!url) return { ok: false, error: "Could not generate URL." };
  return { ok: true, url };
}
