-- ============================================================
-- 0002 — Row Level Security: public reads, admin-only writes
-- ============================================================
alter table public.profiles       enable row level security;
alter table public.projects        enable row level security;
alter table public.experience      enable row level security;
alter table public.skills          enable row level security;
alter table public.certifications  enable row level security;
alter table public.settings        enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

-- profiles: anyone can read (public portfolio content lives here);
-- a user can update their own row; admins can update any row.
drop policy if exists "profiles read"  on public.profiles;
drop policy if exists "profiles write" on public.profiles;
create policy "profiles read"  on public.profiles for select using (true);
create policy "profiles write" on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- content tables: public read, admin all-write
do $$
declare t text;
begin
  foreach t in array array['projects','experience','skills','certifications','settings'] loop
    execute format('drop policy if exists "%s read" on public.%I;', t, t);
    execute format('drop policy if exists "%s write" on public.%I;', t, t);
    execute format('create policy "%s read" on public.%I for select using (true);', t, t);
    execute format('create policy "%s write" on public.%I for all using (public.is_admin()) with check (public.is_admin());', t, t);
  end loop;
end $$;
