-- 0013_profile_highlights.sql
-- Replaces the single `commendation` text field with a repeatable list of
-- highlight cards (icon + rich text), editable from Admin -> Profile. The
-- app migrates any existing `commendation` value into this on read, so
-- nothing is lost, but this column is what the admin now saves new edits
-- to. Idempotent.

alter table public.profiles add column if not exists highlights jsonb default '[]'::jsonb;

update public.profiles
set highlights = jsonb_build_array(jsonb_build_object('icon', '🏅', 'text', commendation))
where (highlights is null or highlights = '[]'::jsonb)
  and commendation is not null and commendation <> '';
