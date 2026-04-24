import { createClient } from "@/lib/supabase/server";
import { getInstructorCourseIds } from "@/lib/data/instructor";
import type { Tables } from "@/types";

export async function getInstructorAssignments(
  userId: string,
): Promise<Tables<"assignments">[]> {
  const courseIds = await getInstructorCourseIds(userId);
  if (courseIds.length === 0) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("assignments")
    .select("*")
    .in("course_id", courseIds)
    .order("due_at", { ascending: true, nullsFirst: false });

  return data ?? [];
}

export async function getAssignmentById(
  id: string,
): Promise<Tables<"assignments"> | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export type StudentAssignmentItem = {
  assignment: Tables<"assignments">;
  submission: Tables<"assignment_submissions"> | null;
};

export async function getStudentAssignments(
  userId: string,
): Promise<StudentAssignmentItem[]> {
  const supabase = await createClient();

  const { data: enrolments } = await supabase
    .from("course_enrolments")
    .select("course_id")
    .eq("user_id", userId)
    .in("status", ["active", "completed"]);

  const courseIds = (enrolments ?? []).map((e) => e.course_id);
  if (courseIds.length === 0) return [];

  const { data: assignments } = await supabase
    .from("assignments")
    .select("*")
    .in("course_id", courseIds)
    .order("due_at", { ascending: true, nullsFirst: false });

  if (!assignments || assignments.length === 0) return [];

  const assignmentIds = assignments.map((a) => a.id);
  const { data: submissions } = await supabase
    .from("assignment_submissions")
    .select("*")
    .eq("user_id", userId)
    .in("assignment_id", assignmentIds)
    .order("created_at", { ascending: false });

  const latestByAssignment = new Map<string, Tables<"assignment_submissions">>();
  for (const sub of submissions ?? []) {
    if (!latestByAssignment.has(sub.assignment_id)) {
      latestByAssignment.set(sub.assignment_id, sub);
    }
  }

  return assignments.map((assignment) => ({
    assignment,
    submission: latestByAssignment.get(assignment.id) ?? null,
  }));
}

export async function getMySubmissionsForAssignment(
  userId: string,
  assignmentId: string,
): Promise<Tables<"assignment_submissions">[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("assignment_submissions")
    .select("*")
    .eq("user_id", userId)
    .eq("assignment_id", assignmentId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

type ProfileRef = Pick<
  Tables<"profiles">,
  "id" | "full_name" | "first_name" | "last_name" | "email"
>;

export type SubmissionWithStudent = {
  submission: Tables<"assignment_submissions">;
  student: ProfileRef | null;
};

export async function getSubmissionsForAssignment(
  assignmentId: string,
): Promise<SubmissionWithStudent[]> {
  const supabase = await createClient();
  const { data: submissions } = await supabase
    .from("assignment_submissions")
    .select("*")
    .eq("assignment_id", assignmentId)
    .order("submitted_at", { ascending: false, nullsFirst: false });

  if (!submissions || submissions.length === 0) return [];

  const userIds = [...new Set(submissions.map((s) => s.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, first_name, last_name, email")
    .in("id", userIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return submissions.map((submission) => ({
    submission,
    student: profileMap.get(submission.user_id) ?? null,
  }));
}
