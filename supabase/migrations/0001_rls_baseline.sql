-- =========================================================
-- LMS — RLS baseline (consolidated)
-- =========================================================
-- Re-runnable: every policy is dropped before recreation.
-- Helper functions is_admin / is_instructor / user_can_access_course /
-- user_can_access_cohort are assumed to already exist in the schema.
-- This script adds two more (instructor-only checks) and then defines
-- policies for every public table.
--
-- Apply in Supabase SQL Editor (single query). Safe to re-run.
-- =========================================================

-- ---------- Helper functions (instructor-only checks) ----------

create or replace function public.is_course_instructor(
  _user_id uuid,
  _course_id uuid
) returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.course_instructors
    where user_id = _user_id and course_id = _course_id
  ) or exists (
    select 1 from public.courses
    where id = _course_id and instructor_user_id = _user_id
  );
$$;

create or replace function public.is_cohort_instructor(
  _user_id uuid,
  _cohort_id uuid
) returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.cohort_instructors
    where user_id = _user_id and cohort_id = _cohort_id
  );
$$;

-- ---------- Enable RLS on every table ----------

alter table public.profiles                enable row level security;
alter table public.user_roles              enable row level security;
alter table public.courses                 enable row level security;
alter table public.course_instructors      enable row level security;
alter table public.course_modules          enable row level security;
alter table public.lessons                 enable row level security;
alter table public.resources               enable row level security;
alter table public.course_enrolments       enable row level security;
alter table public.course_progress         enable row level security;
alter table public.lesson_progress         enable row level security;
alter table public.cohorts                 enable row level security;
alter table public.cohort_instructors      enable row level security;
alter table public.cohort_enrolments       enable row level security;
alter table public.live_sessions           enable row level security;
alter table public.session_attendance      enable row level security;
alter table public.announcements           enable row level security;
alter table public.assignments             enable row level security;
alter table public.assignment_submissions  enable row level security;
alter table public.quizzes                 enable row level security;
alter table public.quiz_questions          enable row level security;
alter table public.quiz_question_options   enable row level security;
alter table public.quiz_attempts           enable row level security;
alter table public.discussion_threads      enable row level security;
alter table public.discussion_posts        enable row level security;
alter table public.notifications           enable row level security;
alter table public.orders                  enable row level security;
alter table public.coupons                 enable row level security;
alter table public.certificates            enable row level security;

-- ---------- profiles ----------
-- Public can read minimal fields for instructor profiles via the admin
-- client (Phases 49 / 55 / 56). For user-scoped queries, a user reads
-- their own row, an instructor reads their students, an admin reads all.

drop policy if exists "profiles self read"           on public.profiles;
drop policy if exists "profiles self update"         on public.profiles;
drop policy if exists "profiles admin all"           on public.profiles;
drop policy if exists "profiles instructor visibility" on public.profiles;

create policy "profiles self read"
on public.profiles for select to authenticated
using (auth.uid() = id);

create policy "profiles self update"
on public.profiles for update to authenticated
using (auth.uid() = id) with check (auth.uid() = id);

create policy "profiles admin all"
on public.profiles for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- An instructor can read profiles of users enrolled in any course or
-- cohort they own. Anchored on enrolment + instructor membership.
create policy "profiles instructor visibility"
on public.profiles for select to authenticated
using (
  exists (
    select 1
    from public.course_enrolments ce
    where ce.user_id = profiles.id
      and public.is_course_instructor(auth.uid(), ce.course_id)
  )
  or exists (
    select 1
    from public.cohort_enrolments coe
    where coe.user_id = profiles.id
      and public.is_cohort_instructor(auth.uid(), coe.cohort_id)
  )
);

-- ---------- user_roles ----------

drop policy if exists "user_roles self read"  on public.user_roles;
drop policy if exists "user_roles admin all"  on public.user_roles;

create policy "user_roles self read"
on public.user_roles for select to authenticated
using (auth.uid() = user_id);

create policy "user_roles admin all"
on public.user_roles for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ---------- courses ----------

drop policy if exists "courses public read"          on public.courses;
drop policy if exists "courses instructor read"      on public.courses;
drop policy if exists "courses instructor manage"    on public.courses;
drop policy if exists "courses admin all"            on public.courses;

create policy "courses public read"
on public.courses for select
to anon, authenticated
using (visibility = 'public' and archived_at is null);

create policy "courses instructor read"
on public.courses for select to authenticated
using (public.is_course_instructor(auth.uid(), id));

create policy "courses instructor manage"
on public.courses for update to authenticated
using (public.is_course_instructor(auth.uid(), id))
with check (public.is_course_instructor(auth.uid(), id));

create policy "courses admin all"
on public.courses for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ---------- course_instructors ----------

drop policy if exists "course_instructors public read" on public.course_instructors;
drop policy if exists "course_instructors admin all"   on public.course_instructors;

-- Public read so the instructor directory + course detail can list teachers.
create policy "course_instructors public read"
on public.course_instructors for select to anon, authenticated
using (true);

create policy "course_instructors admin all"
on public.course_instructors for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ---------- course_modules ----------

drop policy if exists "course_modules public read"   on public.course_modules;
drop policy if exists "course_modules access read"   on public.course_modules;
drop policy if exists "course_modules instructor"    on public.course_modules;
drop policy if exists "course_modules admin all"     on public.course_modules;

-- Public can read modules of public, non-archived courses.
create policy "course_modules public read"
on public.course_modules for select to anon, authenticated
using (
  exists (
    select 1 from public.courses c
    where c.id = course_modules.course_id
      and c.visibility = 'public'
      and c.archived_at is null
  )
);

create policy "course_modules access read"
on public.course_modules for select to authenticated
using (public.user_can_access_course(auth.uid(), course_id));

create policy "course_modules instructor"
on public.course_modules for all to authenticated
using (public.is_course_instructor(auth.uid(), course_id))
with check (public.is_course_instructor(auth.uid(), course_id));

create policy "course_modules admin all"
on public.course_modules for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ---------- lessons ----------

drop policy if exists "lessons preview read"     on public.lessons;
drop policy if exists "lessons access read"      on public.lessons;
drop policy if exists "lessons instructor"       on public.lessons;
drop policy if exists "lessons admin all"        on public.lessons;

-- Public preview lessons (Phase 42) — anyone can read if the parent
-- course is public + lesson is published + is_preview.
create policy "lessons preview read"
on public.lessons for select to anon, authenticated
using (
  is_published = true
  and is_preview = true
  and exists (
    select 1 from public.courses c
    where c.id = lessons.course_id
      and c.visibility = 'public'
      and c.archived_at is null
  )
);

create policy "lessons access read"
on public.lessons for select to authenticated
using (public.user_can_access_course(auth.uid(), course_id));

create policy "lessons instructor"
on public.lessons for all to authenticated
using (public.is_course_instructor(auth.uid(), course_id))
with check (public.is_course_instructor(auth.uid(), course_id));

create policy "lessons admin all"
on public.lessons for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ---------- resources ----------

drop policy if exists "resources access read"  on public.resources;
drop policy if exists "resources instructor"   on public.resources;
drop policy if exists "resources admin all"    on public.resources;

create policy "resources access read"
on public.resources for select to authenticated
using (
  course_id is not null and public.user_can_access_course(auth.uid(), course_id)
);

create policy "resources instructor"
on public.resources for all to authenticated
using (
  course_id is not null and public.is_course_instructor(auth.uid(), course_id)
)
with check (
  course_id is not null and public.is_course_instructor(auth.uid(), course_id)
);

create policy "resources admin all"
on public.resources for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ---------- course_enrolments ----------

drop policy if exists "course_enrolments self read"   on public.course_enrolments;
drop policy if exists "course_enrolments self insert" on public.course_enrolments;
drop policy if exists "course_enrolments instructor"  on public.course_enrolments;
drop policy if exists "course_enrolments admin all"   on public.course_enrolments;

create policy "course_enrolments self read"
on public.course_enrolments for select to authenticated
using (auth.uid() = user_id);

-- Lets a free / coupon checkout create the enrolment row. Paid orders
-- are inserted by the Stripe webhook (service role); this only matters
-- for free / 100%-coupon flows.
create policy "course_enrolments self insert"
on public.course_enrolments for insert to authenticated
with check (auth.uid() = user_id);

create policy "course_enrolments instructor"
on public.course_enrolments for select to authenticated
using (public.is_course_instructor(auth.uid(), course_id));

create policy "course_enrolments admin all"
on public.course_enrolments for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ---------- course_progress ----------

drop policy if exists "course_progress self"          on public.course_progress;
drop policy if exists "course_progress instructor"    on public.course_progress;
drop policy if exists "course_progress admin all"     on public.course_progress;

create policy "course_progress self"
on public.course_progress for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "course_progress instructor"
on public.course_progress for select to authenticated
using (public.is_course_instructor(auth.uid(), course_id));

create policy "course_progress admin all"
on public.course_progress for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ---------- lesson_progress ----------

drop policy if exists "lesson_progress self"          on public.lesson_progress;
drop policy if exists "lesson_progress instructor"    on public.lesson_progress;
drop policy if exists "lesson_progress admin all"     on public.lesson_progress;

create policy "lesson_progress self"
on public.lesson_progress for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "lesson_progress instructor"
on public.lesson_progress for select to authenticated
using (public.is_course_instructor(auth.uid(), course_id));

create policy "lesson_progress admin all"
on public.lesson_progress for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ---------- cohorts ----------

drop policy if exists "cohorts public read"        on public.cohorts;
drop policy if exists "cohorts access read"        on public.cohorts;
drop policy if exists "cohorts instructor"         on public.cohorts;
drop policy if exists "cohorts admin all"          on public.cohorts;

create policy "cohorts public read"
on public.cohorts for select to anon, authenticated
using (
  exists (
    select 1 from public.courses c
    where c.id = cohorts.course_id
      and c.visibility = 'public'
      and c.archived_at is null
  )
);

create policy "cohorts access read"
on public.cohorts for select to authenticated
using (public.user_can_access_cohort(auth.uid(), id));

create policy "cohorts instructor"
on public.cohorts for all to authenticated
using (public.is_cohort_instructor(auth.uid(), id))
with check (public.is_cohort_instructor(auth.uid(), id));

create policy "cohorts admin all"
on public.cohorts for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ---------- cohort_instructors ----------

drop policy if exists "cohort_instructors read"     on public.cohort_instructors;
drop policy if exists "cohort_instructors admin"    on public.cohort_instructors;

create policy "cohort_instructors read"
on public.cohort_instructors for select to authenticated
using (
  public.is_cohort_instructor(auth.uid(), cohort_id)
  or public.user_can_access_cohort(auth.uid(), cohort_id)
);

create policy "cohort_instructors admin"
on public.cohort_instructors for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ---------- cohort_enrolments ----------

drop policy if exists "cohort_enrolments self read"   on public.cohort_enrolments;
drop policy if exists "cohort_enrolments self insert" on public.cohort_enrolments;
drop policy if exists "cohort_enrolments instructor"  on public.cohort_enrolments;
drop policy if exists "cohort_enrolments admin all"   on public.cohort_enrolments;

create policy "cohort_enrolments self read"
on public.cohort_enrolments for select to authenticated
using (auth.uid() = user_id);

create policy "cohort_enrolments self insert"
on public.cohort_enrolments for insert to authenticated
with check (auth.uid() = user_id);

create policy "cohort_enrolments instructor"
on public.cohort_enrolments for all to authenticated
using (public.is_cohort_instructor(auth.uid(), cohort_id))
with check (public.is_cohort_instructor(auth.uid(), cohort_id));

create policy "cohort_enrolments admin all"
on public.cohort_enrolments for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ---------- live_sessions ----------

drop policy if exists "live_sessions enrolee read"   on public.live_sessions;
drop policy if exists "live_sessions instructor"     on public.live_sessions;
drop policy if exists "live_sessions admin all"      on public.live_sessions;

create policy "live_sessions enrolee read"
on public.live_sessions for select to authenticated
using (
  (cohort_id is not null and public.user_can_access_cohort(auth.uid(), cohort_id))
  or (course_id is not null and public.user_can_access_course(auth.uid(), course_id))
);

create policy "live_sessions instructor"
on public.live_sessions for all to authenticated
using (
  (cohort_id is not null and public.is_cohort_instructor(auth.uid(), cohort_id))
  or (course_id is not null and public.is_course_instructor(auth.uid(), course_id))
)
with check (
  (cohort_id is not null and public.is_cohort_instructor(auth.uid(), cohort_id))
  or (course_id is not null and public.is_course_instructor(auth.uid(), course_id))
);

create policy "live_sessions admin all"
on public.live_sessions for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ---------- session_attendance ----------

drop policy if exists "session_attendance self"        on public.session_attendance;
drop policy if exists "session_attendance instructor"  on public.session_attendance;
drop policy if exists "session_attendance admin all"   on public.session_attendance;

create policy "session_attendance self"
on public.session_attendance for select to authenticated
using (auth.uid() = user_id);

create policy "session_attendance instructor"
on public.session_attendance for all to authenticated
using (
  exists (
    select 1 from public.live_sessions ls
    where ls.id = session_attendance.live_session_id
      and (
        (ls.cohort_id is not null and public.is_cohort_instructor(auth.uid(), ls.cohort_id))
        or (ls.course_id is not null and public.is_course_instructor(auth.uid(), ls.course_id))
      )
  )
)
with check (
  exists (
    select 1 from public.live_sessions ls
    where ls.id = session_attendance.live_session_id
      and (
        (ls.cohort_id is not null and public.is_cohort_instructor(auth.uid(), ls.cohort_id))
        or (ls.course_id is not null and public.is_course_instructor(auth.uid(), ls.course_id))
      )
  )
);

create policy "session_attendance admin all"
on public.session_attendance for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ---------- announcements ----------

drop policy if exists "announcements enrolee read"  on public.announcements;
drop policy if exists "announcements instructor"    on public.announcements;
drop policy if exists "announcements admin all"     on public.announcements;

create policy "announcements enrolee read"
on public.announcements for select to authenticated
using (
  is_published = true
  and (
    (cohort_id is not null and public.user_can_access_cohort(auth.uid(), cohort_id))
    or (course_id is not null and public.user_can_access_course(auth.uid(), course_id))
  )
);

create policy "announcements instructor"
on public.announcements for all to authenticated
using (
  (cohort_id is not null and public.is_cohort_instructor(auth.uid(), cohort_id))
  or (course_id is not null and public.is_course_instructor(auth.uid(), course_id))
)
with check (
  (cohort_id is not null and public.is_cohort_instructor(auth.uid(), cohort_id))
  or (course_id is not null and public.is_course_instructor(auth.uid(), course_id))
);

create policy "announcements admin all"
on public.announcements for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ---------- assignments ----------

drop policy if exists "assignments enrolee read"  on public.assignments;
drop policy if exists "assignments instructor"    on public.assignments;
drop policy if exists "assignments admin all"     on public.assignments;

create policy "assignments enrolee read"
on public.assignments for select to authenticated
using (
  (cohort_id is not null and public.user_can_access_cohort(auth.uid(), cohort_id))
  or (course_id is not null and public.user_can_access_course(auth.uid(), course_id))
);

create policy "assignments instructor"
on public.assignments for all to authenticated
using (public.is_course_instructor(auth.uid(), course_id))
with check (public.is_course_instructor(auth.uid(), course_id));

create policy "assignments admin all"
on public.assignments for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ---------- assignment_submissions ----------

drop policy if exists "assignment_submissions self"        on public.assignment_submissions;
drop policy if exists "assignment_submissions instructor"  on public.assignment_submissions;
drop policy if exists "assignment_submissions admin all"   on public.assignment_submissions;

create policy "assignment_submissions self"
on public.assignment_submissions for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "assignment_submissions instructor"
on public.assignment_submissions for all to authenticated
using (
  exists (
    select 1 from public.assignments a
    where a.id = assignment_submissions.assignment_id
      and public.is_course_instructor(auth.uid(), a.course_id)
  )
)
with check (
  exists (
    select 1 from public.assignments a
    where a.id = assignment_submissions.assignment_id
      and public.is_course_instructor(auth.uid(), a.course_id)
  )
);

create policy "assignment_submissions admin all"
on public.assignment_submissions for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ---------- quizzes ----------

drop policy if exists "quizzes enrolee read"  on public.quizzes;
drop policy if exists "quizzes instructor"    on public.quizzes;
drop policy if exists "quizzes admin all"     on public.quizzes;

create policy "quizzes enrolee read"
on public.quizzes for select to authenticated
using (public.user_can_access_course(auth.uid(), course_id));

create policy "quizzes instructor"
on public.quizzes for all to authenticated
using (public.is_course_instructor(auth.uid(), course_id))
with check (public.is_course_instructor(auth.uid(), course_id));

create policy "quizzes admin all"
on public.quizzes for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ---------- quiz_questions ----------

drop policy if exists "quiz_questions enrolee read"  on public.quiz_questions;
drop policy if exists "quiz_questions instructor"    on public.quiz_questions;
drop policy if exists "quiz_questions admin all"     on public.quiz_questions;

create policy "quiz_questions enrolee read"
on public.quiz_questions for select to authenticated
using (
  exists (
    select 1 from public.quizzes q
    where q.id = quiz_questions.quiz_id
      and public.user_can_access_course(auth.uid(), q.course_id)
  )
);

create policy "quiz_questions instructor"
on public.quiz_questions for all to authenticated
using (
  exists (
    select 1 from public.quizzes q
    where q.id = quiz_questions.quiz_id
      and public.is_course_instructor(auth.uid(), q.course_id)
  )
)
with check (
  exists (
    select 1 from public.quizzes q
    where q.id = quiz_questions.quiz_id
      and public.is_course_instructor(auth.uid(), q.course_id)
  )
);

create policy "quiz_questions admin all"
on public.quiz_questions for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ---------- quiz_question_options ----------
-- NOTE: students see options including the `is_correct` flag. Strip it
-- in the data layer before sending to the client; RLS only gates row
-- visibility, not column visibility.

drop policy if exists "quiz_question_options enrolee read"  on public.quiz_question_options;
drop policy if exists "quiz_question_options instructor"    on public.quiz_question_options;
drop policy if exists "quiz_question_options admin all"     on public.quiz_question_options;

create policy "quiz_question_options enrolee read"
on public.quiz_question_options for select to authenticated
using (
  exists (
    select 1
    from public.quiz_questions qq
    join public.quizzes q on q.id = qq.quiz_id
    where qq.id = quiz_question_options.question_id
      and public.user_can_access_course(auth.uid(), q.course_id)
  )
);

create policy "quiz_question_options instructor"
on public.quiz_question_options for all to authenticated
using (
  exists (
    select 1
    from public.quiz_questions qq
    join public.quizzes q on q.id = qq.quiz_id
    where qq.id = quiz_question_options.question_id
      and public.is_course_instructor(auth.uid(), q.course_id)
  )
)
with check (
  exists (
    select 1
    from public.quiz_questions qq
    join public.quizzes q on q.id = qq.quiz_id
    where qq.id = quiz_question_options.question_id
      and public.is_course_instructor(auth.uid(), q.course_id)
  )
);

create policy "quiz_question_options admin all"
on public.quiz_question_options for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ---------- quiz_attempts ----------

drop policy if exists "quiz_attempts self"        on public.quiz_attempts;
drop policy if exists "quiz_attempts instructor"  on public.quiz_attempts;
drop policy if exists "quiz_attempts admin all"   on public.quiz_attempts;

create policy "quiz_attempts self"
on public.quiz_attempts for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "quiz_attempts instructor"
on public.quiz_attempts for select to authenticated
using (
  exists (
    select 1 from public.quizzes q
    where q.id = quiz_attempts.quiz_id
      and public.is_course_instructor(auth.uid(), q.course_id)
  )
);

create policy "quiz_attempts admin all"
on public.quiz_attempts for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ---------- discussion_threads ----------

drop policy if exists "discussion_threads enrolee read"   on public.discussion_threads;
drop policy if exists "discussion_threads enrolee insert" on public.discussion_threads;
drop policy if exists "discussion_threads author update"  on public.discussion_threads;
drop policy if exists "discussion_threads instructor"     on public.discussion_threads;
drop policy if exists "discussion_threads admin all"      on public.discussion_threads;

create policy "discussion_threads enrolee read"
on public.discussion_threads for select to authenticated
using (
  (cohort_id is not null and public.user_can_access_cohort(auth.uid(), cohort_id))
  or (course_id is not null and public.user_can_access_course(auth.uid(), course_id))
);

create policy "discussion_threads enrolee insert"
on public.discussion_threads for insert to authenticated
with check (
  auth.uid() = created_by
  and (
    (cohort_id is not null and public.user_can_access_cohort(auth.uid(), cohort_id))
    or (course_id is not null and public.user_can_access_course(auth.uid(), course_id))
  )
);

create policy "discussion_threads author update"
on public.discussion_threads for update to authenticated
using (auth.uid() = created_by)
with check (auth.uid() = created_by);

create policy "discussion_threads instructor"
on public.discussion_threads for all to authenticated
using (
  (cohort_id is not null and public.is_cohort_instructor(auth.uid(), cohort_id))
  or (course_id is not null and public.is_course_instructor(auth.uid(), course_id))
)
with check (
  (cohort_id is not null and public.is_cohort_instructor(auth.uid(), cohort_id))
  or (course_id is not null and public.is_course_instructor(auth.uid(), course_id))
);

create policy "discussion_threads admin all"
on public.discussion_threads for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ---------- discussion_posts ----------

drop policy if exists "discussion_posts enrolee read"   on public.discussion_posts;
drop policy if exists "discussion_posts author insert"  on public.discussion_posts;
drop policy if exists "discussion_posts author update"  on public.discussion_posts;
drop policy if exists "discussion_posts author delete"  on public.discussion_posts;
drop policy if exists "discussion_posts instructor"     on public.discussion_posts;
drop policy if exists "discussion_posts admin all"      on public.discussion_posts;

create policy "discussion_posts enrolee read"
on public.discussion_posts for select to authenticated
using (
  exists (
    select 1 from public.discussion_threads t
    where t.id = discussion_posts.thread_id
      and (
        (t.cohort_id is not null and public.user_can_access_cohort(auth.uid(), t.cohort_id))
        or (t.course_id is not null and public.user_can_access_course(auth.uid(), t.course_id))
      )
  )
);

create policy "discussion_posts author insert"
on public.discussion_posts for insert to authenticated
with check (
  auth.uid() = author_user_id
  and exists (
    select 1 from public.discussion_threads t
    where t.id = discussion_posts.thread_id
      and (
        (t.cohort_id is not null and public.user_can_access_cohort(auth.uid(), t.cohort_id))
        or (t.course_id is not null and public.user_can_access_course(auth.uid(), t.course_id))
      )
  )
);

create policy "discussion_posts author update"
on public.discussion_posts for update to authenticated
using (auth.uid() = author_user_id)
with check (auth.uid() = author_user_id);

create policy "discussion_posts author delete"
on public.discussion_posts for delete to authenticated
using (auth.uid() = author_user_id);

create policy "discussion_posts instructor"
on public.discussion_posts for all to authenticated
using (
  exists (
    select 1 from public.discussion_threads t
    where t.id = discussion_posts.thread_id
      and (
        (t.cohort_id is not null and public.is_cohort_instructor(auth.uid(), t.cohort_id))
        or (t.course_id is not null and public.is_course_instructor(auth.uid(), t.course_id))
      )
  )
)
with check (
  exists (
    select 1 from public.discussion_threads t
    where t.id = discussion_posts.thread_id
      and (
        (t.cohort_id is not null and public.is_cohort_instructor(auth.uid(), t.cohort_id))
        or (t.course_id is not null and public.is_course_instructor(auth.uid(), t.course_id))
      )
  )
);

create policy "discussion_posts admin all"
on public.discussion_posts for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ---------- notifications ----------
-- Inserts come from the server-side fanout module via the service role
-- (Phase 37). User-scoped policy only handles read + mark-as-read.

drop policy if exists "notifications self read"    on public.notifications;
drop policy if exists "notifications self update"  on public.notifications;
drop policy if exists "notifications admin all"    on public.notifications;

create policy "notifications self read"
on public.notifications for select to authenticated
using (auth.uid() = user_id);

create policy "notifications self update"
on public.notifications for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "notifications admin all"
on public.notifications for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ---------- orders ----------

drop policy if exists "orders self read"   on public.orders;
drop policy if exists "orders self insert" on public.orders;
drop policy if exists "orders admin all"   on public.orders;

create policy "orders self read"
on public.orders for select to authenticated
using (auth.uid() = user_id);

create policy "orders self insert"
on public.orders for insert to authenticated
with check (auth.uid() = user_id);

create policy "orders admin all"
on public.orders for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ---------- coupons ----------

drop policy if exists "coupons active read"  on public.coupons;
drop policy if exists "coupons admin all"    on public.coupons;

-- Authenticated users need to validate codes at checkout. Restricting
-- to active coupons keeps draft/expired ones private.
create policy "coupons active read"
on public.coupons for select to authenticated
using (is_active = true);

create policy "coupons admin all"
on public.coupons for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ---------- certificates ----------

drop policy if exists "certificates self read"   on public.certificates;
drop policy if exists "certificates instructor"  on public.certificates;
drop policy if exists "certificates admin all"   on public.certificates;

create policy "certificates self read"
on public.certificates for select to authenticated
using (auth.uid() = user_id);

create policy "certificates instructor"
on public.certificates for select to authenticated
using (public.is_course_instructor(auth.uid(), course_id));

create policy "certificates admin all"
on public.certificates for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- =========================================================
-- Storage bucket policies
-- =========================================================

-- ---------- avatars (public bucket) ----------

drop policy if exists "avatars public read"      on storage.objects;
drop policy if exists "avatars self write"       on storage.objects;

create policy "avatars public read"
on storage.objects for select to anon, authenticated
using (bucket_id = 'avatars');

-- Path convention: <user_id>/<filename>. First path segment must equal
-- the caller's UID for write access.
create policy "avatars self write"
on storage.objects for all to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- ---------- course-images (public bucket) ----------

drop policy if exists "course-images public read"   on storage.objects;
drop policy if exists "course-images instructor"    on storage.objects;

create policy "course-images public read"
on storage.objects for select to anon, authenticated
using (bucket_id = 'course-images');

create policy "course-images instructor"
on storage.objects for all to authenticated
using (
  bucket_id = 'course-images'
  and (public.is_instructor(auth.uid()) or public.is_admin(auth.uid()))
)
with check (
  bucket_id = 'course-images'
  and (public.is_instructor(auth.uid()) or public.is_admin(auth.uid()))
);

-- ---------- lesson-resources (private bucket) ----------
-- Path convention: <course_id>/<filename>. Read requires course access;
-- write requires course-instructor membership.

drop policy if exists "lesson-resources access read" on storage.objects;
drop policy if exists "lesson-resources instructor"  on storage.objects;

create policy "lesson-resources access read"
on storage.objects for select to authenticated
using (
  bucket_id = 'lesson-resources'
  and public.user_can_access_course(
    auth.uid(),
    ((storage.foldername(name))[1])::uuid
  )
);

create policy "lesson-resources instructor"
on storage.objects for all to authenticated
using (
  bucket_id = 'lesson-resources'
  and public.is_course_instructor(
    auth.uid(),
    ((storage.foldername(name))[1])::uuid
  )
)
with check (
  bucket_id = 'lesson-resources'
  and public.is_course_instructor(
    auth.uid(),
    ((storage.foldername(name))[1])::uuid
  )
);

-- ---------- submissions (private bucket) ----------
-- Path convention: <user_id>/<assignment_id>/<filename>. Owner can
-- read/write their own; instructor of the assignment's course can read.

drop policy if exists "submissions self"        on storage.objects;
drop policy if exists "submissions instructor"  on storage.objects;

create policy "submissions self"
on storage.objects for all to authenticated
using (
  bucket_id = 'submissions'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'submissions'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "submissions instructor"
on storage.objects for select to authenticated
using (
  bucket_id = 'submissions'
  and exists (
    select 1
    from public.assignments a
    where a.id = ((storage.foldername(name))[2])::uuid
      and public.is_course_instructor(auth.uid(), a.course_id)
  )
);

-- =========================================================
-- Done.
-- =========================================================
