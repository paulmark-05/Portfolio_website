-- 0007_availability_badge.sql
-- Editable hero availability badge ("Open to…"). Idempotent.
alter table public.profiles add column if not exists availability_badge text;
alter table public.profiles add column if not exists about_title text;
