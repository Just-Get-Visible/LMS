-- =========================================================
-- LMS dev/demo seed
-- =========================================================
-- BEFORE RUNNING:
-- 1. Sign up a user via the app (so an auth.users row + profile exist)
-- 2. Replace the placeholder UUID below with that user's id
--    (find it in Supabase Dashboard → Authentication → Users)
-- 3. Apply the consolidated RLS migrations from the project README
-- 4. Run this script in the Supabase SQL editor
--
-- Re-runnable: deletes existing rows whose slug starts with `demo-`
-- before re-inserting. Existing user roles/profile are preserved.
-- =========================================================

do $$
declare
  -- ⚠️  REPLACE THIS WITH YOUR auth.users.id
  v_user uuid := '58b40eb1-516d-4a4b-b4bd-21b2272baa09'::uuid;

  v_course_self  uuid;
  v_course_coh   uuid;

  v_module1_self uuid;
  v_module2_self uuid;
  v_module1_coh  uuid;

  v_lesson_welcome uuid;
  v_lesson_setup   uuid;
  v_lesson_quiz    uuid;
  v_lesson_assign  uuid;
  v_lesson_live    uuid;

  v_cohort     uuid;
  v_assignment uuid;
  v_quiz       uuid;
  v_question1  uuid;
  v_question2  uuid;
  v_thread     uuid;
begin
  -- Verify the user exists
  if not exists (select 1 from auth.users where id = v_user) then
    raise exception 'Replace v_user with a real auth.users.id before running this seed.';
  end if;

  -- Wipe existing demo content (cascade deletes modules/lessons/etc.)
  delete from public.courses where slug like 'demo-%';
  delete from public.coupons where code like 'DEMO%';
  delete from public.notifications where user_id = v_user and metadata->>'demo' = 'true';

  -- ---------------------------------------------------------
  -- Roles — grant all three so you can flip between dashboards
  -- ---------------------------------------------------------
  insert into public.user_roles (user_id, role)
  values (v_user, 'admin'), (v_user, 'instructor'), (v_user, 'student')
  on conflict (user_id, role) do nothing;

  -- ---------------------------------------------------------
  -- Course 1 — self-paced, free, with certificate
  -- ---------------------------------------------------------
  insert into public.courses (
    slug, title, subtitle, short_description, description,
    visibility, delivery_type, difficulty_level, estimated_duration_hours,
    is_free, certificate_enabled,
    instructor_user_id, created_by, published_at
  )
  values (
    'demo-self-paced',
    'Demo Self-Paced Course',
    'Learn at your own pace',
    'A complete tour of the platform — courses, lessons, quizzes, assignments and certificates.',
    E'In this course you will:\n\n- Tour the LMS\n- Complete a quiz\n- Submit an assignment\n- Earn a certificate',
    'public', 'self_paced', 'beginner', 2.5,
    true, true,
    v_user, v_user, now()
  )
  returning id into v_course_self;

  insert into public.course_instructors (course_id, user_id, is_primary)
  values (v_course_self, v_user, true)
  on conflict (course_id, user_id) do nothing;

  -- Modules
  insert into public.course_modules (course_id, title, description, sort_order, is_published)
  values (v_course_self, 'Getting started', 'Welcome and orientation', 0, true)
  returning id into v_module1_self;

  insert into public.course_modules (course_id, title, description, sort_order, is_published)
  values (v_course_self, 'Hands-on practice', 'Quiz and assignment', 1, true)
  returning id into v_module2_self;

  -- Lessons
  insert into public.lessons (course_id, module_id, title, lesson_type, summary, sort_order, is_published, is_preview, estimated_duration_minutes)
  values (v_course_self, v_module1_self, 'Welcome', 'video', 'A short intro video.', 0, true, true, 5)
  returning id into v_lesson_welcome;

  insert into public.lessons (course_id, module_id, title, lesson_type, summary, content_html, sort_order, is_published, estimated_duration_minutes)
  values (
    v_course_self, v_module1_self,
    'Setting up your profile', 'text',
    'Get your profile ready.',
    '<p>Head to <strong>Profile</strong> from the dashboard and fill in your details.</p>',
    1, true, 10
  )
  returning id into v_lesson_setup;

  insert into public.lessons (course_id, module_id, title, lesson_type, sort_order, is_published, estimated_duration_minutes)
  values (v_course_self, v_module2_self, 'Take the quiz', 'quiz', 0, true, 15)
  returning id into v_lesson_quiz;

  insert into public.lessons (course_id, module_id, title, lesson_type, sort_order, is_published, estimated_duration_minutes)
  values (v_course_self, v_module2_self, 'Submit the assignment', 'assignment', 1, true, 30)
  returning id into v_lesson_assign;

  -- ---------------------------------------------------------
  -- Course 2 — cohort-based, paid
  -- ---------------------------------------------------------
  insert into public.courses (
    slug, title, subtitle, short_description, description,
    visibility, delivery_type, difficulty_level, estimated_duration_hours,
    is_free, price_amount, currency_code, certificate_enabled,
    instructor_user_id, created_by, published_at
  )
  values (
    'demo-cohort',
    'Demo Cohort Programme',
    '6-week cohort with live sessions',
    'Learn alongside a group with weekly live sessions.',
    E'Cohort highlights:\n\n- Weekly live calls\n- Group assignments\n- Community discussions',
    'public', 'cohort', 'intermediate', 30,
    false, 199, 'GBP', true,
    v_user, v_user, now()
  )
  returning id into v_course_coh;

  insert into public.course_instructors (course_id, user_id, is_primary)
  values (v_course_coh, v_user, true)
  on conflict (course_id, user_id) do nothing;

  insert into public.course_modules (course_id, title, sort_order, is_published)
  values (v_course_coh, 'Week 1: Foundations', 0, true)
  returning id into v_module1_coh;

  insert into public.lessons (course_id, module_id, title, lesson_type, sort_order, is_published, is_preview, estimated_duration_minutes)
  values (v_course_coh, v_module1_coh, 'Kickoff session', 'live_session', 0, true, true, 60)
  returning id into v_lesson_live;

  -- ---------------------------------------------------------
  -- Cohort + auto-enrol the demo user
  -- ---------------------------------------------------------
  insert into public.cohorts (
    course_id, name, slug, description, status,
    starts_at, ends_at, timezone, live_session_frequency,
    capacity, price_amount, currency_code, created_by
  )
  values (
    v_course_coh,
    'Demo Cohort — Spring',
    'demo-cohort-spring',
    'First demo cohort.',
    'open',
    now() + interval '7 days',
    now() + interval '49 days',
    'Europe/London', 'weekly',
    20, 199, 'GBP',
    v_user
  )
  returning id into v_cohort;

  insert into public.cohort_instructors (cohort_id, user_id, role)
  values (v_cohort, v_user, 'lead')
  on conflict (cohort_id, user_id) do nothing;

  -- ---------------------------------------------------------
  -- Enrol the demo user in both courses + the cohort
  -- ---------------------------------------------------------
  insert into public.course_enrolments (course_id, user_id, status, source)
  values
    (v_course_self, v_user, 'active', 'seed'),
    (v_course_coh,  v_user, 'active', 'seed')
  on conflict (course_id, user_id) do nothing;

  insert into public.cohort_enrolments (cohort_id, user_id, status)
  values (v_cohort, v_user, 'active')
  on conflict (cohort_id, user_id) do nothing;

  -- ---------------------------------------------------------
  -- A live session for the cohort
  -- ---------------------------------------------------------
  insert into public.live_sessions (
    course_id, cohort_id, lesson_id,
    title, description, host_user_id, provider,
    scheduled_start_at, scheduled_end_at, timezone, status
  )
  values (
    v_course_coh, v_cohort, v_lesson_live,
    'Cohort kickoff', 'Meet your cohort and the instructor.', v_user, 'zoom',
    now() + interval '7 days', now() + interval '7 days 1 hour',
    'Europe/London', 'scheduled'
  );

  -- ---------------------------------------------------------
  -- Assignment + Quiz
  -- ---------------------------------------------------------
  insert into public.assignments (
    course_id, lesson_id, title, instructions,
    due_at, max_score, passing_score,
    allow_late_submissions, allow_multiple_submissions, created_by
  )
  values (
    v_course_self, v_lesson_assign,
    'Reflection essay',
    'Write 200 words about what you''ve learned.',
    now() + interval '14 days', 100, 60,
    true, false, v_user
  )
  returning id into v_assignment;

  insert into public.quizzes (
    course_id, lesson_id, title, description,
    pass_percent, attempts_allowed, show_results_immediately,
    created_by
  )
  values (
    v_course_self, v_lesson_quiz,
    'Knowledge check', 'Two quick questions to confirm you''re paying attention.',
    50, null, true,
    v_user
  )
  returning id into v_quiz;

  insert into public.quiz_questions (quiz_id, question_text, sort_order, points)
  values (v_quiz, 'What does LMS stand for?', 0, 1)
  returning id into v_question1;

  insert into public.quiz_question_options (question_id, option_text, is_correct, sort_order) values
    (v_question1, 'Learning Management System', true, 0),
    (v_question1, 'Lesson Mailing Service', false, 1),
    (v_question1, 'Long Module Standard', false, 2);

  insert into public.quiz_questions (quiz_id, question_text, sort_order, points)
  values (v_quiz, 'How many lessons does a cohort-based course need?', 1, 1)
  returning id into v_question2;

  insert into public.quiz_question_options (question_id, option_text, is_correct, sort_order) values
    (v_question2, 'At least one', true, 0),
    (v_question2, 'Exactly ten', false, 1),
    (v_question2, 'A hundred', false, 2);

  -- ---------------------------------------------------------
  -- Resources (course-level + lesson-level, all external links so
  -- this seed runs without storage buckets)
  -- ---------------------------------------------------------
  insert into public.resources (course_id, title, description, resource_type, external_url, is_downloadable, is_public)
  values (
    v_course_self, 'Reference docs', 'External documentation', 'link',
    'https://supabase.com/docs', false, true
  );

  insert into public.resources (course_id, lesson_id, title, description, resource_type, external_url, is_downloadable, is_public)
  values (
    v_course_self, v_lesson_setup,
    'Profile checklist', 'Tick off as you go', 'link',
    'https://example.com/profile-checklist', false, false
  );

  -- ---------------------------------------------------------
  -- Announcement (published) for the cohort
  -- ---------------------------------------------------------
  insert into public.announcements (
    cohort_id, title, body, is_published, published_at, created_by
  )
  values (
    v_cohort,
    'Welcome to the cohort!',
    E'Hi everyone — looking forward to meeting you next week.\n\nMake sure to fill in your profile.',
    true, now(), v_user
  );

  -- ---------------------------------------------------------
  -- Discussion thread + a starter post
  -- ---------------------------------------------------------
  insert into public.discussion_threads (
    scope, cohort_id, title, body, created_by
  )
  values (
    'cohort', v_cohort,
    'Introduce yourself', 'Drop a quick note about who you are and what you want to learn.',
    v_user
  )
  returning id into v_thread;

  insert into public.discussion_posts (thread_id, author_user_id, body)
  values (v_thread, v_user, 'I''ll go first — excited to be running this cohort!');

  -- ---------------------------------------------------------
  -- A coupon
  -- ---------------------------------------------------------
  insert into public.coupons (code, description, coupon_type, value_amount, currency_code, max_uses, is_active, created_by)
  values ('DEMO50', '50% off any course', 'percentage', 50, 'GBP', 100, true, v_user);

  -- ---------------------------------------------------------
  -- A few notifications
  -- ---------------------------------------------------------
  insert into public.notifications (user_id, type, title, body, link_url, is_read, metadata)
  values
    (v_user, 'announcement', 'Welcome to the platform', 'Have a look around your dashboard.',
     '/dashboard', false, '{"demo": "true"}'::jsonb),
    (v_user, 'live_session', 'Cohort kickoff next week', 'Your first live session is scheduled.',
     '/dashboard/cohorts/' || v_cohort::text, false, '{"demo": "true"}'::jsonb),
    (v_user, 'assignment', 'New assignment', 'Reflection essay is due in 2 weeks.',
     '/dashboard/assignments', true, '{"demo": "true"}'::jsonb);

  raise notice 'Seed complete. Sign in as % to explore.', v_user;
end $$;
