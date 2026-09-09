-- 0008_achievements_and_active.sql
-- Adds the projects.active flag (counters + Active badge) and an achievements
-- table (CMS-managed). Idempotent.

alter table public.projects add column if not exists active boolean default false;

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  icon text default '',
  category text default '',
  highlight boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- RLS: public read, authenticated write (mirrors the other content tables).
alter table public.achievements enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'achievements' and policyname = 'achievements_read') then
    create policy achievements_read on public.achievements for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'achievements' and policyname = 'achievements_write') then
    create policy achievements_write on public.achievements for all
      using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;
end $$;

-- Add to the realtime publication so the public site live-updates.
do $$
begin
  begin
    execute 'alter publication supabase_realtime add table public.achievements';
  exception when duplicate_object then null;
  end;
end $$;
