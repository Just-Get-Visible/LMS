import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types";

type ProfileRef = Pick<
  Tables<"profiles">,
  "id" | "full_name" | "first_name" | "last_name" | "avatar_url"
>;

export type ThreadListItem = {
  thread: Tables<"discussion_threads">;
  scopeLabel: string;
  scopeName: string | null;
};

export async function getAccessibleThreads(): Promise<ThreadListItem[]> {
  const supabase = await createClient();
  const { data: threads } = await supabase
    .from("discussion_threads")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(100);

  if (!threads || threads.length === 0) return [];

  const courseIds = [
    ...new Set(
      threads
        .map((t) => t.course_id)
        .filter((id): id is string => !!id),
    ),
  ];
  const cohortIds = [
    ...new Set(
      threads
        .map((t) => t.cohort_id)
        .filter((id): id is string => !!id),
    ),
  ];

  const [coursesRes, cohortsRes] = await Promise.all([
    courseIds.length > 0
      ? supabase.from("courses").select("id, title").in("id", courseIds)
      : Promise.resolve({ data: null as Pick<Tables<"courses">, "id" | "title">[] | null }),
    cohortIds.length > 0
      ? supabase.from("cohorts").select("id, name").in("id", cohortIds)
      : Promise.resolve({ data: null as Pick<Tables<"cohorts">, "id" | "name">[] | null }),
  ]);

  const courseMap = new Map(
    (coursesRes.data ?? []).map((c) => [c.id, c.title]),
  );
  const cohortMap = new Map(
    (cohortsRes.data ?? []).map((c) => [c.id, c.name]),
  );

  return threads.map((thread) => {
    let scopeLabel: string = thread.scope;
    let scopeName: string | null = null;
    if (thread.course_id && courseMap.has(thread.course_id)) {
      scopeLabel = "Course";
      scopeName = courseMap.get(thread.course_id) ?? null;
    } else if (thread.cohort_id && cohortMap.has(thread.cohort_id)) {
      scopeLabel = "Cohort";
      scopeName = cohortMap.get(thread.cohort_id) ?? null;
    }
    return { thread, scopeLabel, scopeName };
  });
}

export async function getThreadById(
  threadId: string,
): Promise<Tables<"discussion_threads"> | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("discussion_threads")
    .select("*")
    .eq("id", threadId)
    .maybeSingle();
  return data;
}

export type PostWithAuthor = {
  post: Tables<"discussion_posts">;
  author: ProfileRef | null;
};

export async function getPostsForThread(
  threadId: string,
): Promise<PostWithAuthor[]> {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("discussion_posts")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (!posts || posts.length === 0) return [];

  const userIds = [...new Set(posts.map((p) => p.author_user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, first_name, last_name, avatar_url")
    .in("id", userIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return posts.map((post) => ({
    post,
    author: profileMap.get(post.author_user_id) ?? null,
  }));
}
