-- ============================================================
-- 0001 — schema
-- ============================================================
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  role        text not null default 'viewer' check (role in ('admin','viewer')),
  name        text,
  title       text,
  subtitle    text,
  roles       jsonb default '[]',
  cta_primary jsonb,
  cta_ghost   jsonb,
  resume_url  text,
  about_md    text,
  quick_facts jsonb default '[]',
  about_image text,
  hero_image  text,
  updated_at  timestamptz default now()
);

create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  description text,
  date_label  text,
  featured    boolean default false,
  tech_stack  text[] default '{}',
  github_url  text,
  live_url    text,
  image       text,
  sort_order  int default 0,
  updated_at  timestamptz default now()
);

create table if not exists public.experience (
  id           uuid primary key default gen_random_uuid(),
  company      text not null,
  role         text not null,
  duration     text,
  step_label   text,
  description  text,
  achievements text[] default '{}',
  tags         text[] default '{}',
  sort_order   int default 0,
  updated_at   timestamptz default now()
);

create table if not exists public.skills (
  id         uuid primary key default gen_random_uuid(),
  category   text not null,
  name       text not null,
  full_name  text,
  color      text,
  sort_order int default 0
);

create table if not exists public.certifications (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  issuer      text,
  date_label  text,
  description text,
  image       text,
  sort_order  int default 0,
  updated_at  timestamptz default now()
);

create table if not exists public.settings (
  id            int primary key default 1 check (id = 1),
  email         text,
  phone         text,
  linkedin      text,
  github        text,
  contact_image text,
  seo_title     text,
  seo_desc      text,
  seo_keywords  text[],
  updated_at    timestamptz default now()
);

-- auto-create a profile row on signup (default viewer; promote to admin manually)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
