-- 0016_role_summary.sql
-- One-line "what I do" sentence shown under the sidebar tagline, replacing
-- the old rotating role titles. Idempotent.
alter table public.profiles add column if not exists role_summary text;
