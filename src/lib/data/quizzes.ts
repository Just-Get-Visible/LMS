import { createClient } from "@/lib/supabase/server";
import { getInstructorCourseIds } from "@/lib/data/instructor";
import type { Tables } from "@/types";

export async function getInstructorQuizzes(
  userId: string,
): Promise<Tables<"quizzes">[]> {
  const courseIds = await getInstructorCourseIds(userId);
  if (courseIds.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("quizzes")
    .select("*")
    .in("course_id", courseIds)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getQuizById(
  id: string,
): Promise<Tables<"quizzes"> | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export type QuestionWithOptions = {
  question: Tables<"quiz_questions">;
  options: Tables<"quiz_question_options">[];
};

export async function getQuizQuestionsWithOptions(
  quizId: string,
): Promise<QuestionWithOptions[]> {
  const supabase = await createClient();

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("sort_order", { ascending: true });

  if (!questions || questions.length === 0) return [];

  const questionIds = questions.map((q) => q.id);
  const { data: options } = await supabase
    .from("quiz_question_options")
    .select("*")
    .in("question_id", questionIds)
    .order("sort_order", { ascending: true });

  const optionsByQuestion = new Map<
    string,
    Tables<"quiz_question_options">[]
  >();
  for (const opt of options ?? []) {
    const list = optionsByQuestion.get(opt.question_id) ?? [];
    list.push(opt);
    optionsByQuestion.set(opt.question_id, list);
  }

  return questions.map((question) => ({
    question,
    options: optionsByQuestion.get(question.id) ?? [],
  }));
}

export async function getStudentAttempts(
  userId: string,
  quizId: string,
): Promise<Tables<"quiz_attempts">[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("user_id", userId)
    .eq("quiz_id", quizId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getAttemptById(
  attemptId: string,
): Promise<Tables<"quiz_attempts"> | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("id", attemptId)
    .maybeSingle();
  return data;
}

export async function getStudentQuizzes(
  userId: string,
): Promise<Tables<"quizzes">[]> {
  const supabase = await createClient();

  const { data: enrolments } = await supabase
    .from("course_enrolments")
    .select("course_id")
    .eq("user_id", userId)
    .in("status", ["active", "completed"]);

  const courseIds = (enrolments ?? []).map((e) => e.course_id);
  if (courseIds.length === 0) return [];

  const { data } = await supabase
    .from("quizzes")
    .select("*")
    .in("course_id", courseIds)
    .order("created_at", { ascending: false });

  return data ?? [];
}
