"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdmin, requireInstructor } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/user";
import { isCourseInstructor } from "@/lib/data/enrolments";
import { getQuizById } from "@/lib/data/quizzes";
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/types";

export type QuizFieldErrors = Partial<
  Record<"title" | "course_id", string>
>;

export type QuizActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: QuizFieldErrors };

export type QuestionActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

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

async function assertCanManageCourse(userId: string, courseId: string) {
  const ok =
    (await isCourseInstructor(userId, courseId)) || (await isAdmin(userId));
  if (!ok) throw new Error("You don't have permission to manage this quiz.");
}

async function assertCanManageQuiz(userId: string, quizId: string) {
  const quiz = await getQuizById(quizId);
  if (!quiz) throw new Error("Quiz not found.");
  await assertCanManageCourse(userId, quiz.course_id);
  return quiz;
}

async function assertCanManageQuestion(userId: string, questionId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quiz_questions")
    .select("quiz_id")
    .eq("id", questionId)
    .maybeSingle();
  if (!data) throw new Error("Question not found.");
  return assertCanManageQuiz(userId, data.quiz_id);
}

async function assertCanManageOption(userId: string, optionId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quiz_question_options")
    .select("question_id")
    .eq("id", optionId)
    .maybeSingle();
  if (!data) throw new Error("Option not found.");
  return assertCanManageQuestion(userId, data.question_id);
}

export async function createQuizAction(
  _prev: QuizActionState,
  formData: FormData,
): Promise<QuizActionState> {
  const user = await requireUser();
  await requireInstructor(user.id);

  const title = nullableString(formData.get("title"));
  const courseId = nullableString(formData.get("course_id"));

  const fieldErrors: QuizFieldErrors = {};
  if (!title) fieldErrors.title = "Title is required.";
  if (!courseId) fieldErrors.course_id = "Course is required.";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  await assertCanManageCourse(user.id, courseId!);

  const insert: TablesInsert<"quizzes"> = {
    course_id: courseId!,
    title: title!,
    description: nullableString(formData.get("description")),
    created_by: user.id,
  };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quizzes")
    .insert(insert)
    .select("id")
    .single();

  if (error) return { status: "error", message: error.message };

  revalidatePath("/instructor/quizzes");
  redirect(`/instructor/quizzes/${data.id}`);
}

export async function updateQuizAction(
  _prev: QuizActionState,
  formData: FormData,
): Promise<QuizActionState> {
  const id = nullableString(formData.get("quiz_id"));
  if (!id) return { status: "error", message: "Missing quiz id." };

  const user = await requireUser();
  await assertCanManageQuiz(user.id, id);

  const title = nullableString(formData.get("title"));
  if (!title) {
    return {
      status: "error",
      message: "Title is required.",
      fieldErrors: { title: "Title is required." },
    };
  }

  const update: TablesUpdate<"quizzes"> = {
    title,
    description: nullableString(formData.get("description")),
    time_limit_minutes: nullableNumber(formData.get("time_limit_minutes")),
    pass_percent: nullableNumber(formData.get("pass_percent")),
    attempts_allowed: nullableNumber(formData.get("attempts_allowed")),
    randomize_questions: bool(formData.get("randomize_questions")),
    show_results_immediately: bool(formData.get("show_results_immediately")),
  };

  const supabase = await createClient();
  const { error } = await supabase.from("quizzes").update(update).eq("id", id);

  if (error) return { status: "error", message: error.message };

  revalidatePath(`/instructor/quizzes/${id}`);
  revalidatePath("/instructor/quizzes");
  return { status: "success", message: "Quiz saved." };
}

export async function deleteQuizAction(quizId: string): Promise<void> {
  const user = await requireUser();
  await assertCanManageQuiz(user.id, quizId);

  const supabase = await createClient();
  await supabase.from("quizzes").delete().eq("id", quizId);

  revalidatePath("/instructor/quizzes");
  redirect("/instructor/quizzes");
}

function pickQuestionType(v: FormDataEntryValue | null): string {
  return v === "multi_select" ? "multi_select" : "multiple_choice";
}

export async function createQuestionAction(
  _prev: QuestionActionState,
  formData: FormData,
): Promise<QuestionActionState> {
  const quizId = nullableString(formData.get("quiz_id"));
  const text = nullableString(formData.get("question_text"));
  if (!quizId || !text) {
    return { status: "error", message: "Question text is required." };
  }

  const user = await requireUser();
  await assertCanManageQuiz(user.id, quizId);

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("quiz_questions")
    .select("sort_order")
    .eq("quiz_id", quizId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;

  const { error } = await supabase.from("quiz_questions").insert({
    quiz_id: quizId,
    question_text: text,
    question_type: pickQuestionType(formData.get("question_type")),
    points: nullableNumber(formData.get("points")) ?? 1,
    sort_order: nextOrder,
  });

  if (error) return { status: "error", message: error.message };

  revalidatePath(`/instructor/quizzes/${quizId}`);
  return { status: "success", message: "Question added." };
}

export async function updateQuestionAction(
  _prev: QuestionActionState,
  formData: FormData,
): Promise<QuestionActionState> {
  const questionId = nullableString(formData.get("question_id"));
  if (!questionId) return { status: "error", message: "Missing question id." };

  const user = await requireUser();
  const quiz = await assertCanManageQuestion(user.id, questionId);

  const text = nullableString(formData.get("question_text"));
  if (!text) {
    return { status: "error", message: "Question text is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("quiz_questions")
    .update({
      question_text: text,
      question_type: pickQuestionType(formData.get("question_type")),
      explanation: nullableString(formData.get("explanation")),
      points: nullableNumber(formData.get("points")) ?? 1,
    })
    .eq("id", questionId);

  if (error) return { status: "error", message: error.message };

  revalidatePath(`/instructor/quizzes/${quiz.id}`);
  return { status: "success", message: "Question saved." };
}

export async function deleteQuestionAction(
  quizId: string,
  questionId: string,
): Promise<void> {
  const user = await requireUser();
  await assertCanManageQuiz(user.id, quizId);

  const supabase = await createClient();
  await supabase.from("quiz_questions").delete().eq("id", questionId);

  revalidatePath(`/instructor/quizzes/${quizId}`);
}

export async function moveQuestionAction(
  quizId: string,
  questionId: string,
  direction: "up" | "down",
): Promise<void> {
  const user = await requireUser();
  await assertCanManageQuiz(user.id, quizId);

  const supabase = await createClient();
  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("id, sort_order")
    .eq("quiz_id", quizId)
    .order("sort_order", { ascending: true });

  if (!questions) return;
  const idx = questions.findIndex((q) => q.id === questionId);
  if (idx < 0) return;
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= questions.length) return;

  const current = questions[idx];
  const target = questions[swapIdx];
  await supabase
    .from("quiz_questions")
    .update({ sort_order: target.sort_order })
    .eq("id", current.id);
  await supabase
    .from("quiz_questions")
    .update({ sort_order: current.sort_order })
    .eq("id", target.id);

  revalidatePath(`/instructor/quizzes/${quizId}`);
}

export async function addOptionAction(
  _prev: QuestionActionState,
  formData: FormData,
): Promise<QuestionActionState> {
  const questionId = nullableString(formData.get("question_id"));
  const text = nullableString(formData.get("option_text"));
  if (!questionId || !text) {
    return { status: "error", message: "Option text is required." };
  }

  const user = await requireUser();
  const quiz = await assertCanManageQuestion(user.id, questionId);

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("quiz_question_options")
    .select("sort_order")
    .eq("question_id", questionId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;

  const { error } = await supabase.from("quiz_question_options").insert({
    question_id: questionId,
    option_text: text,
    sort_order: nextOrder,
    is_correct: false,
  });

  if (error) return { status: "error", message: error.message };

  revalidatePath(`/instructor/quizzes/${quiz.id}`);
  return { status: "success", message: "Option added." };
}

export async function deleteOptionAction(
  quizId: string,
  optionId: string,
): Promise<void> {
  const user = await requireUser();
  await assertCanManageOption(user.id, optionId);

  const supabase = await createClient();
  await supabase.from("quiz_question_options").delete().eq("id", optionId);

  revalidatePath(`/instructor/quizzes/${quizId}`);
}

export async function setOptionCorrectAction(
  quizId: string,
  questionId: string,
  optionId: string,
): Promise<void> {
  const user = await requireUser();
  await assertCanManageQuestion(user.id, questionId);

  const supabase = await createClient();

  // Branch on question type. Single-choice = exclusive (clear all, set one).
  // Multi-select = independent toggle.
  const { data: question } = await supabase
    .from("quiz_questions")
    .select("question_type")
    .eq("id", questionId)
    .maybeSingle();

  if (question?.question_type === "multi_select") {
    const { data: current } = await supabase
      .from("quiz_question_options")
      .select("is_correct")
      .eq("id", optionId)
      .maybeSingle();
    await supabase
      .from("quiz_question_options")
      .update({ is_correct: !current?.is_correct })
      .eq("id", optionId);
  } else {
    await supabase
      .from("quiz_question_options")
      .update({ is_correct: false })
      .eq("question_id", questionId);
    await supabase
      .from("quiz_question_options")
      .update({ is_correct: true })
      .eq("id", optionId);
  }

  revalidatePath(`/instructor/quizzes/${quizId}`);
}
