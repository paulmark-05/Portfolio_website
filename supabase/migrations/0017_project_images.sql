-- 0017_project_images.sql
-- Multiple preview photos per project (collage thumbnail + gallery),
-- alongside the existing single `image` column kept as a legacy fallback
-- for rows saved before this. Idempotent.
alter table public.projects add column if not exists images jsonb default '[]';
