-- =========================================================
-- courses.landing_page — launch-page content
-- =========================================================
-- One JSONB column holding all optional marketing-page sections.
-- Every field is optional; missing sections don't render.
--
-- Expected shape (enforced by the app, not the DB):
-- {
--   "published": boolean,
--   "hero":         { "tagline"?: string, "ctaLabel"?: string },
--   "problemStats": [{ "stat": string, "label": string }],
--   "whatYouGet":   [string],
--   "bonus":        { "title": string, "valueDisplay"?: string, "description"?: string },
--   "faqs":         [{ "q": string, "a": string }],
--   "testimonials": [{ "quote": string, "name": string, "role"?: string, "avatarUrl"?: string }],
--   "instructorCredibility": [string]
-- }
--
-- Re-runnable.
-- =========================================================

alter table public.courses
  add column if not exists landing_page jsonb;

comment on column public.courses.landing_page is
  'Optional launch-landing-page content. When { "published": true }, /courses/{slug} renders the launch design instead of the catalog view.';
