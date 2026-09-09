-- 0005_cms_redesign.sql
-- New CMS fields for the redesigned Experience and Projects editors, plus
-- Realtime publication so the public site live-updates on content changes.
-- Safe to run on an existing database (idempotent).

-- Experience: structured date range + current flag + location.
-- (The public `duration` label is still stored, auto-composed by the CMS.)
alter table public.experience add column if not exists start_date text;
alter table public.experience add column if not exists end_date   text;
alter table public.experience add column if not exists current    boolean default false;
alter table public.experience add column if not exists location   text;

-- Projects: structured month-year value + current flag.
-- (The public `date_label` is still stored, auto-composed by the CMS.)
alter table public.projects   add column if not exists date_value text;
alter table public.projects   add column if not exists current    boolean default false;

-- ----------------------------------------------------------------------------
-- Realtime live sync (FIX 12): add the content tables to the realtime
-- publication so the frontend receives insert/update/delete events.
-- Wrapped so re-running doesn't error if a table is already a member.
do $$
declare t text;
begin
  foreach t in array array['profiles','projects','experience','skills','certifications','settings']
  loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then
      null; -- already in the publication
    end;
  end loop;
end $$;
