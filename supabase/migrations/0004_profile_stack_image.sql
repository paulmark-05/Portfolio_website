-- 0004_profile_stack_image.sql
-- Adds the CMS-editable tech-stack (workstation) image to profiles.
-- Safe to run on an existing database; no-op if the column already exists.
alter table public.profiles
  add column if not exists stack_image text;
