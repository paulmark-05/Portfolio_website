-- 0009_cms_full_content.sql
-- Makes the rest of the homepage CMS-driven. All idempotent / additive.

-- Profile: hero info cards, About highlight card (commendation)
alter table public.profiles add column if not exists info_cards jsonb default '[]'::jsonb;
alter table public.profiles add column if not exists commendation text;

-- Settings: contact + tech-stack section copy
alter table public.settings add column if not exists contact_eyebrow text;
alter table public.settings add column if not exists contact_heading text;
alter table public.settings add column if not exists contact_description text;
alter table public.settings add column if not exists stack_title text;
alter table public.settings add column if not exists stack_quote text;
alter table public.settings add column if not exists stack_description text;

-- Achievements: richer schema
alter table public.achievements add column if not exists organization text default '';
alter table public.achievements add column if not exists year text default '';
alter table public.achievements add column if not exists link text default '';
alter table public.achievements add column if not exists visible boolean default true;
