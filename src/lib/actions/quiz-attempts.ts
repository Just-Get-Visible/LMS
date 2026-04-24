"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/user";
import { getInheritedUnlockTime } from "@/lib/data/drip";
import { canAccessCourseContent } from "@/lib/data/enrolments";
import {
  getAttemptById,
  getQuizById,
  getQuizQuestionsWithOptions,
} from "@/lib/data/quizzes";
import { createClient } from "@/lib/supabase/server";

export type AttemptResult = { ok: true } | { ok: false; error: string };

export async function startAttemptAction(quizId: string): Promise<void> {
  const user = await requireUser();

  const quiz = await getQuizById(quizId);
  if (!quiz) return;

  const canAccess = await canAccessCourseContent(user.id, quiz.course_id);
  if (!canAccess) return;

  const unlockAt = await getInheritedUnlockTime(user.id, quiz.lesson_id);
  if (unlockAt) return;

  const supabase = await createClient();

  const { data: existingInProgress } = await supabase
    .from("quiz_attempts")
    .select("id")
    .eq("user_id", user.id)
    .eq("quiz_id", quizId)
    .is("submitted_at", null)
    .limit(1)
    .maybeSingle();

  if (existingInProgress) {
    redirect(`/dashboard/quizzes/${quizId}/attempts/${existingInProgress.id}`);
  }

  if (quiz.attempts_allowed != null) {
    const { count } = await supabase
      .from("quiz_attempts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("quiz_id", quizId)
      .not("submitted_at", "is", null);

    if ((count ?? 0) >= quiz.attempts_allowed) return;
  }

  const { data: attempt, error } = await supabase
    .from("quiz_attempts")
    .insert({
      user_id: user.id,
      quiz_id: quizId,
    })
    .select("id")
    .single();

  if (error || !attempt) return;

  revalidatePath(`/dashboard/quizzes/${quizId}`);
  redirect(`/dashboard/quizzes/${quizId}/attempts/${attempt.id}`);
}

export type SubmitAttemptState =
  | { status: "idle" }
  | { status: "error"; message: string };

export async function submitAttemptAction(
  _prev: SubmitAttemptState,
  formData: FormData,
): Promise<SubmitAttemptState> {
  const attemptId = String(formData.get("attempt_id") ?? "");
  const quizId = String(formData.get("quiz_id") ?? "");
  if (!attemptId || !quizId) {
    return { status: "error", message: "Missing attempt or quiz id." };
  }

  const user = await requireUser();

  const attempt = await getAttemptById(attemptId);
  if (!attempt || attempt.user_id !== user.id || attempt.quiz_id !== quizId) {
    return { status: "error", message: "Attempt not found." };
  }
  if (attempt.submitted_at) {
    return { status: "error", message: "This attempt was already submitted." };
  }

  const quiz = await getQuizById(quizId);
  if (!quiz) return { status: "error", message: "Quiz not found." };

  const questions = await getQuizQuestionsWithOptions(quizId);

  // Collect answers as arrays — works for both radio (single value) and
  // checkbox (multiple values) inputs sharing the same `name` attribute.
  const answers: Record<string, string[]> = {};
  for (const { question } of questions) {
    const values = formData
      .getAll(`question_${question.id}`)
      .filter((v): v is string => typeof v === "string" && v.length > 0);
    if (values.length > 0) answers[question.id] = values;
  }

  let totalPoints = 0;
  let earned = 0;
  for (const { question, options } of questions) {
    const points = Number(question.points);
    totalPoints += points;
    const selected = answers[question.id] ?? [];
    if (selected.length === 0) continue;

    const correctIds = options.filter((o) => o.is_correct).map((o) => o.id);
    const correctSet = new Set(correctIds);
    const selectedSet = new Set(selected);

    if (question.question_type === "multi_select") {
      // All correct options selected, no extras.
      const exact =
        selectedSet.size === correctSet.size &&
        [...selectedSet].every((id) => correctSet.has(id));
      if (exact && correctSet.size > 0) earned += points;
    } else {
      // Single-choice: exactly one selection that is correct.
      if (selected.length === 1 && correctSet.has(selected[0])) {
        earned += points;
      }
    }
  }

  const scorePercent =
    totalPoints > 0 ? Math.round((earned / totalPoints) * 10000) / 100 : 0;
  const passed =
    quiz.pass_percent != null
      ? scorePercent >= Number(quiz.pass_percent)
      : null;

  const supabase = await createClient();
  const { error } = await supabase
    .from("quiz_attempts")
    .update({
      submitted_at: new Date().toISOString(),
      score: earned,
      score_percent: scorePercent,
      passed,
      answers_json: answers,
    })
    .eq("id", attemptId);

  if (error) return { status: "error", message: error.message };

  revalidatePath(`/dashboard/quizzes/${quizId}`);
  revalidatePath(`/dashboard/quizzes/${quizId}/attempts/${attemptId}`);
  redirect(`/dashboard/quizzes/${quizId}/attempts/${attemptId}`);
}
