-- 0010_section_config.sql
-- Lets the admin reorder/hide the middle page sections (Experience, Skills,
-- Achievements, Projects, Certificates) — the public page and the nav menu
-- both read this same list, in this same order. Idempotent.

alter table public.settings add column if not exists sections jsonb;

-- Backfill a sensible default for the existing settings row (Skills ahead
-- of Achievements, Achievements hidden) — matches the site's built-in
-- fallback, so this is a no-op change in effect until you edit it from
-- /admin → Page sections.
update public.settings
set sections = '[
  {"key":"work","visible":true},
  {"key":"stack","visible":true},
  {"key":"achievements","visible":false},
  {"key":"projects","visible":true},
  {"key":"certs","visible":true}
]'::jsonb
where id = 1 and sections is null;
