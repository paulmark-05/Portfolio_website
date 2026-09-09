-- 0012_experience_logo.sql
-- Optional company-logo image per experience entry (falls back to the
-- colored-initials badge in the UI when empty). Idempotent.

alter table public.experience add column if not exists logo text default '';
