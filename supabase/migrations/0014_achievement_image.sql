-- 0014_achievement_image.sql
-- Optional proof photo per achievement (e.g. a compensation cheque, an
-- award certificate, a thank-you note) — uploaded via Admin -> Achievements
-- and stored in Supabase Storage like other admin-uploaded images.
-- Idempotent.

alter table public.achievements add column if not exists image text default '';
