-- 0015_project_demo_url.sql
-- Optional walkthrough-video link per project (e.g. a Loom/YouTube demo of
-- the features in action), separate from the deployed live-site link.
-- Idempotent.

alter table public.projects add column if not exists demo_url text default '';
