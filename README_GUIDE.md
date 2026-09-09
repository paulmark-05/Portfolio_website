# Nayani Paul Portfolio — Complete Project Guide

> A step-by-step manual for someone who **did not build this project** but needs to run, edit, deploy, and maintain it.
>
> This is a React + Vite + TypeScript single-page portfolio with a self-managed **Supabase CMS** mounted at `/admin`. The public site reads content from a Postgres database (with a built-in seed fallback), and an authenticated admin can edit every piece of content without touching code.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Local Development Setup](#2-local-development-setup)
3. [Environment Variables](#3-environment-variables)
4. [Supabase Setup (Complete Beginner Guide)](#4-supabase-setup-complete-beginner-guide)
5. [CMS User Manual](#5-cms-user-manual)
6. [Content Management Workflow](#6-content-management-workflow)
7. [Production Build Process](#7-production-build-process)
8. [Deployment Guides](#8-deployment-guides)
9. [Maintenance Guide](#9-maintenance-guide)
10. [Troubleshooting](#10-troubleshooting)
11. [Future Development Guide](#11-future-development-guide)
12. [Architecture Deep Dive](#12-architecture-deep-dive)
13. [Appendix: Known Limitations & Technical Debt](#13-appendix-known-limitations--technical-debt)

---

## 1. Project Overview

### What the application does

This is the personal portfolio website of Nayani Paul, a CS undergraduate and full-stack/AI developer. It is a **single long-scroll landing page** with animated sections (hero, about, experience, tech stack, projects, awards/certifications, contact), plus a password-protected **content management system (CMS)** at `/admin` where the site owner can edit every visible piece of content — text, images, projects, skills, certificates, SEO tags, and contact details — entirely from a browser, with no code changes and no redeploy required.

A defining feature is its **graceful fallback**: the site ships with a complete copy of its content baked into the code (the "seed"). If Supabase is not configured, or the database is empty, or a network call fails, the public site still renders fully from that seed. Supabase is therefore *additive* — it turns static content into editable content.

### Tech stack used

| Layer | Technology | Version (from `package.json`) | Role |
|---|---|---|---|
| Build tool / dev server | **Vite** | ^5.4.0 | Fast dev server + production bundler |
| UI framework | **React** | ^18.3.1 | Component rendering |
| Language | **TypeScript** | ^5.5.3 | Static typing across all `src/**` |
| Routing | **react-router-dom** | ^6.26.0 | `/`, `/admin/*`, 404 |
| Server state / caching | **@tanstack/react-query** | ^5.51.0 | Fetches and caches site content + admin lists |
| Backend (BaaS) | **@supabase/supabase-js** | ^2.45.0 | Postgres DB, Auth, Storage, Row Level Security |
| Document `<head>` / SEO | **react-helmet-async** | ^2.0.5 | Dynamic title/description/keywords |
| Forms | **react-hook-form** | ^7.52.0 | Declared as a dependency (admin forms currently use plain controlled state) |
| Validation | **zod** | ^3.23.8 | Declared as a dependency (available for future schema validation) |
| Styling | **Hand-written CSS** | — | `src/styles/globals.css` (public) + `src/styles/admin.css` (CMS). No Tailwind/CSS-in-JS at build time. |
| Fonts | Google Fonts | — | Fraunces (serif), Inter (sans), JetBrains Mono (mono) — loaded in `index.html` |

> Note: `react-hook-form` and `zod` are installed but the current admin pages use simple React `useState`-based controlled inputs rather than `react-hook-form`. They are available for future hardening.

### Architecture overview

```mermaid
flowchart TD
    Browser["Browser"] -->|"/"| Public["Public Site (Home.tsx)"]
    Browser -->|"/admin/*"| Admin["Admin CMS (AdminApp.tsx)"]

    Public --> useContent["useContent() hook"]
    Admin --> ReactQuery["React Query (admin lists)"]

    useContent --> fetchSiteContent["fetchSiteContent() in lib/queries.ts"]
    fetchSiteContent --> SupabaseCheck{"Supabase configured<br/>& reachable?"}
    SupabaseCheck -->|"No / error / empty"| SEED["SEED content (lib/content.ts)"]
    SupabaseCheck -->|"Yes"| DB[("Supabase Postgres<br/>profiles, projects,<br/>experience, skills,<br/>certifications, settings")]

    ReactQuery --> SupabaseClient["supabase-js anon client"]
    SupabaseClient --> DB
    SupabaseClient --> Storage[("Supabase Storage<br/>media bucket")]
    SupabaseClient --> Auth["Supabase Auth"]

    DB -. "Row Level Security:\npublic read, admin write" .- SupabaseClient
    Storage -. "public read, admin write" .- SupabaseClient
```

The browser loads one React app. The router sends `/` to the public portfolio and `/admin/*` to the CMS. Both talk to Supabase through a **single anon-key client** (`src/lib/supabaseClient.ts`). The public site can only *read* (enforced by Row Level Security); the CMS can *write* only after an admin logs in. There is no separate backend server — Supabase **is** the backend.

### Folder structure explanation

```
nayani-portfolio/
├── index.html                 # HTML entry; loads fonts + /src/main.tsx
├── package.json               # Scripts + dependencies
├── package-lock.json          # Locked dependency tree
├── tsconfig.json              # TypeScript compiler config (strict)
├── vite.config.ts             # Vite config (React plugin, dev port 5173)
├── vercel.json                # SPA rewrite so /admin/* serves index.html on Vercel
├── .env.example               # Template for environment variables
├── .gitignore                 # Ignores node_modules, dist, .env, .env.local
├── README.md                  # Original short readme from the author
│
├── public/                    # Static assets copied verbatim into dist/
│   └── images/
│       ├── about2.webp        # About-section photo (right side)
│       ├── tech5.webp         # Tech-stack photo (behind the bubbles)
│       └── getintouch5.webp   # Contact-section photo
│
├── legacy/
│   └── original-portfolio.html  # The original single-file site, kept for visual diffing
│
├── supabase/
│   ├── migrations/
│   │   ├── 0001_init_schema.sql     # Tables + signup trigger
│   │   ├── 0002_rls_policies.sql    # Row Level Security policies
│   │   └── 0003_storage_buckets.sql # `media` bucket + storage policies
│   └── seed.sql                     # Initial content to insert into the DB
│
└── src/
    ├── main.tsx               # React root; imports both stylesheets
    ├── App.tsx                # Top-level providers + router
    ├── vite-env.d.ts          # Types for VITE_* env vars
    │
    ├── pages/
    │   ├── Home.tsx           # Assembles all public sections in order
    │   └── NotFound.tsx       # 404 page
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Nav.tsx        # Top nav, scroll-spy active link, theme toggle, résumé link
    │   │   ├── Footer.tsx     # Footer line
    │   │   ├── Seo.tsx        # Helmet-driven <head> tags
    │   │   └── Grain.tsx      # No-op (grain is CSS body::before)
    │   ├── sections/
    │   │   ├── Hero.tsx        # Two-stage hero + typewriter roles + code card
    │   │   ├── About.tsx       # About copy + quick facts + commendation + photo
    │   │   ├── Experience.tsx  # Pinned horizontal-scroll experience rail
    │   │   ├── Stack.tsx       # Tech-stack copy + floating skill bubbles
    │   │   ├── Projects.tsx    # Project cards (image, desc, chips, links)
    │   │   ├── Certs.tsx       # Certificate carousel + modal lightbox
    │   │   └── Contact.tsx     # Contact copy + links + photo
    │   └── ui/
    │       └── PhotoPanel.tsx  # Reusable framed photo (used by About + Contact)
    │
    ├── hooks/
    │   ├── useContent.ts          # React Query wrapper around fetchSiteContent()
    │   ├── useHeroMorph.ts         # Scroll-driven two-stage hero animation
    │   ├── usePinnedExperience.ts  # Scroll-driven pinned horizontal experience scroll
    │   ├── useTechBubbles.ts       # Positions/animates the skill bubbles on an arc
    │   ├── useReveal.ts            # IntersectionObserver reveal-on-scroll
    │   ├── useScrollSpy.ts         # Active section highlight + nav blur on scroll
    │   └── useTheme.ts             # Light/dark theme persistence
    │
    ├── lib/
    │   ├── types.ts           # All TypeScript interfaces for content
    │   ├── content.ts         # SEED — full fallback content, typed
    │   ├── supabaseClient.ts  # Creates the anon Supabase client (or null)
    │   └── queries.ts         # fetchSiteContent() + mediaUrl() helpers
    │
    ├── context/
    │   └── AuthContext.tsx    # Auth provider: session, isAdmin, signIn, signOut
    │
    ├── admin/
    │   ├── AdminApp.tsx        # Admin router (login + protected pages)
    │   ├── AdminLayout.tsx     # Sidebar shell around admin pages
    │   ├── Login.tsx           # Email/password login form
    │   ├── ProtectedRoute.tsx  # Guards admin pages (must be logged-in admin)
    │   ├── components/
    │   │   ├── DataTable.tsx     # Generic list table (used by CRUD pages)
    │   │   ├── FormDrawer.tsx    # Slide-over form + <Field> label wrapper
    │   │   └── ImageUploader.tsx # Uploads/downscales to Storage `media` bucket
    │   └── pages/
    │       ├── Dashboard.tsx        # Counts + quick links
    │       ├── Profile.tsx          # Hero + About content (single row)
    │       ├── Projects.tsx         # Projects CRUD
    │       ├── Experience.tsx       # Experience CRUD
    │       ├── Skills.tsx           # Skills CRUD
    │       ├── Certifications.tsx   # Certifications CRUD
    │       ├── Contact.tsx          # Contact settings (email/links/photo)
    │       ├── Seo.tsx              # SEO settings (title/desc/keywords)
    │       └── MediaLibrary.tsx     # Browse/upload/delete Storage files
    │
    └── styles/
        ├── globals.css        # Public-site CSS (design tokens + all sections)
        └── admin.css          # CMS CSS (reuses the same design tokens)
```

### Public site features

- **Two-stage scroll hero** (`Hero.tsx` + `useHeroMorph.ts`): a centered intro that fades/scales away as you scroll, revealing a split layout with copy on the left and an on-brand code card (or a photo if a hero image is set) on the right. Includes a **typewriter** that cycles the role list.
- **About section** with rich-text paragraphs, a "Quick facts" grid, a commendation callout, and a framed photo on the right.
- **Pinned horizontal-scroll Experience** (`Experience.tsx` + `usePinnedExperience.ts`): vertical scrolling moves a horizontal rail of experience cards and highlights the active one. Stacks vertically on mobile (≤760px).
- **Tech Stack** with **floating glassmorphism bubbles** (`Stack.tsx` + `useTechBubbles.ts`) arranged on an arc around a workstation photo; each bubble shows a short label and reveals the full tool name on hover.
- **Projects list** with preview images, HTML-rich descriptions (metric highlights via `<span class="m">`), tech chips, and Code/Live-demo links.
- **Certifications carousel** (`Certs.tsx`) with arrow + dot navigation, a details panel, and a full **modal lightbox** supporting keyboard navigation (←/→/Esc).
- **Light/dark theme toggle** (`useTheme.ts`) that respects the OS preference and persists the choice to `localStorage`.
- **Reveal-on-scroll** animations (`useReveal.ts`), **scroll-spy** nav highlighting (`useScrollSpy.ts`), smooth-scroll anchors, paper-grain overlay, and `prefers-reduced-motion` handling in the hero.
- **Dynamic SEO** tags driven by the database (`Seo.tsx`).
- **Resilient images**: every `<img>` hides itself (or shows a placeholder) on error, so broken media never breaks the layout.

### CMS/Admin features

Reachable at `/admin` (login at `/admin/login`). All of these write to Supabase and are protected by both a route guard and database-level Row Level Security:

- **Dashboard** — counts of projects/experience/skills/certifications with quick links.
- **Profile** — hero headline, subtitle/lede (HTML allowed), typewriter roles, résumé URL, about paragraphs, about image, and optional hero image.
- **Projects / Experience / Skills / Certifications** — full create / read / update / delete via a shared table + slide-over form pattern.
- **Contact** — email, phone, LinkedIn, GitHub, and contact photo.
- **SEO** — title tag, meta description, and keywords.
- **Media Library** — browse, upload, copy-path, and delete files in the Storage `media` bucket. Uploads are auto-downscaled to ≤1400px wide WebP in the browser before upload.

---

## 2. Local Development Setup

### Prerequisites

| Tool | Recommended version | Why |
|---|---|---|
| **Node.js** | **18 LTS or newer** (20 or 22 ideal) | Vite 5 requires Node 18+. This guide was verified on Node v22. |
| **npm** | Comes with Node (v9+ fine; v10 verified) | Installs dependencies, runs scripts |
| **Git** | Any recent version | Cloning, version control, deploys |

> There is no `engines` field in `package.json`, so npm will not block older Node versions — but Vite 5 will fail on Node < 18. If you see cryptic build errors, check `node --version` first.

Check your versions:

```bash
node --version    # expect v18.x, v20.x, or v22.x
npm --version     # expect 9.x or 10.x
git --version
```

If you need to manage multiple Node versions, install [nvm](https://github.com/nvm-sh/nvm) and run `nvm install 20 && nvm use 20`.

### How to install dependencies

From the project root (the folder containing `package.json`):

```bash
# If you received a zip, unzip it first, then:
cd nayani-portfolio

npm install
```

This reads `package-lock.json` and installs the exact locked dependency tree into `node_modules/`.

### How to run locally

```bash
npm run dev
```

This starts the Vite dev server. By default (`vite.config.ts` sets `server.port: 5173`):

- Public site: **http://localhost:5173**
- CMS: **http://localhost:5173/admin**

The dev server hot-reloads on save. **You do not need Supabase to see the site** — it renders from the built-in seed content. You only need Supabase to log into the CMS and edit content (see [Section 4](#4-supabase-setup-complete-beginner-guide)).

Optional — create your env file first if you already have Supabase keys:

```bash
cp .env.example .env.local
# then edit .env.local with your real values (see Section 3)
```

### How to verify everything works

1. **Public site renders.** Open http://localhost:5173. You should see the centered "Hi, I'm Nayani." intro. Scroll down — the hero should morph into the split layout, the experience rail should scroll horizontally, skill bubbles should float in, projects and certificates should appear.
2. **Theme toggle works.** Click the sun/moon button top-right; the palette should switch and persist across reloads.
3. **Routing works.** Visit http://localhost:5173/admin. Without Supabase configured you should see a message: *"Supabase isn't configured. Add `.env.local`…"*. That message **proves the admin route and guard are working** — it is expected until you add env vars.
4. **404 works.** Visit http://localhost:5173/some-nonsense → the "404 — That page wandered off." page.
5. **Production build succeeds.** Run `npm run build` (see [Section 7](#7-production-build-process)). A clean build emits a `dist/` folder with no TypeScript errors.

### Common startup issues and fixes

| Symptom | Cause | Fix |
|---|---|---|
| `command not found: npm` | Node not installed / not on PATH | Install Node 18+ from nodejs.org or via nvm |
| Cryptic `vite` crash on `npm run dev` | Node version < 18 | Upgrade Node (`nvm install 20`) |
| Port 5173 already in use | Another dev server is running | Stop the other process, or run `npm run dev -- --port 5174` |
| Blank white page, console error about modules | Stale/partial `node_modules` | Delete `node_modules` + `package-lock.json`, run `npm install` again |
| CMS shows "Supabase isn't configured" | No `.env.local` | Expected if you haven't set up Supabase yet — see Section 4 |
| Changes to `.env.local` not picked up | Vite reads env only at startup | Stop and restart `npm run dev` |
| Fonts look wrong / unstyled flash | Offline (Google Fonts blocked) | Fonts load from Google CDN; they fall back to system fonts offline |

---

## 3. Environment Variables

This project uses **Vite environment variables**. Only variables prefixed with `VITE_` are exposed to the browser bundle (this is a Vite rule). Both required variables are *public* values safe to ship to the browser.

Vite loads env files in this order of precedence (highest last): `.env`, `.env.local`, `.env.[mode]`, `.env.[mode].local`. For local development, use **`.env.local`** (it is git-ignored).

### Every variable

| Variable | Required? | What it does |
|---|---|---|
| `VITE_SUPABASE_URL` | **Required for CMS** (optional for public site) | Your Supabase project's REST/Auth/Storage base URL, e.g. `https://abcdefgh.supabase.co`. Used by `supabaseClient.ts` to create the client. |
| `VITE_SUPABASE_ANON_KEY` | **Required for CMS** (optional for public site) | Your Supabase project's **anon public** key (a long JWT). This is the *only* key the frontend uses. It is safe to expose because Row Level Security restricts what it can do. |

### Required vs optional

- **Public site:** *Neither* variable is strictly required. If both are missing, `supabaseEnabled` is `false` and the site renders entirely from `SEED` content in `src/lib/content.ts`. This is by design.
- **CMS / editable content:** *Both* variables are required. Without them, `/admin` shows the "not configured" message and login is disabled.

> ⚠️ **Never** put the Supabase **`service_role`** key in this project. It is a secret that bypasses all Row Level Security. The frontend uses the anon key only, on purpose. The code in `supabaseClient.ts` is written to use only `VITE_SUPABASE_ANON_KEY`. If you ever see a `service_role` key in client code or in a `VITE_*` variable, treat it as a security incident: rotate the key immediately in the Supabase dashboard.

### Example `.env.local`

```bash
# .env.local  (git-ignored — never commit this file)

# Supabase — anon (public) key ONLY. Never the service_role key.
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR-LONG-ANON-KEY.signature
```

Where to find these values: Supabase Dashboard → your project → **Project Settings → API**. Copy **Project URL** into `VITE_SUPABASE_URL` and the **`anon` `public`** key into `VITE_SUPABASE_ANON_KEY`.

After editing `.env.local`, **restart the dev server** (`Ctrl-C` then `npm run dev`).

---

## 4. Supabase Setup (Complete Beginner Guide)

> This section assumes you have **never used Supabase before**. Supabase is a hosted backend: a Postgres database, user authentication, file storage, and auto-generated APIs, all in one dashboard. We will create a project, build the database, set permissions, create an admin user, and connect the CMS.

### 4.0 Mental model (read this first)

- The site's content lives in **six Postgres tables**: `profiles`, `projects`, `experience`, `skills`, `certifications`, `settings`.
- Images live in a **Storage bucket** called `media`.
- **Row Level Security (RLS)** is the rule engine that says *"anyone may read content, but only an admin may change it."* It runs inside the database, so it cannot be bypassed from the browser.
- Your login is a **Supabase Auth user**. A matching row is auto-created in `profiles` with `role = 'viewer'`. You manually promote yourself to `role = 'admin'`. Only then can you edit content.

```mermaid
flowchart LR
    A["Create Supabase project"] --> B["Run 0001 schema"]
    B --> C["Run 0002 RLS policies"]
    C --> D["Run 0003 storage bucket"]
    D --> E["Run seed.sql (content)"]
    E --> F["Create Auth user"]
    F --> G["UPDATE profiles SET role='admin'"]
    G --> H["Put URL + anon key in .env.local"]
    H --> I["Log in at /admin/login"]
```

### 4.1 Create a Supabase project

1. Go to **https://supabase.com** and sign up / log in (GitHub login is easiest).
2. Click **New project**.
3. Pick an **organization** (create one if prompted).
4. Set:
   - **Name:** e.g. `nayani-portfolio`
   - **Database Password:** generate a strong one and **save it** somewhere safe (a password manager). You'll need it for direct DB access and backups.
   - **Region:** choose the region closest to your visitors (e.g. an India/Singapore region for Kolkata-based traffic).
5. Click **Create new project** and wait ~1–2 minutes for provisioning.
6. When ready, go to **Project Settings → API** and copy two values:
   - **Project URL** → this is your `VITE_SUPABASE_URL`.
   - **`anon` `public`** key → this is your `VITE_SUPABASE_ANON_KEY`.
   - **Ignore** the `service_role` key — you will not use it here.

### 4.2 Running the SQL migrations

Supabase has a built-in **SQL Editor**. You will run four scripts **in order**. Each file is in the repo under `supabase/`.

1. In the left sidebar, click **SQL Editor → New query**.
2. Open the repo file `supabase/migrations/0001_init_schema.sql`, copy its **entire** contents, paste into the editor, and click **Run**. This creates all six tables and a trigger that auto-creates a `profiles` row whenever someone signs up.
3. New query → paste `supabase/migrations/0002_rls_policies.sql` → **Run**. This enables Row Level Security and creates the "public read / admin write" policies plus the `is_admin()` helper function.
4. New query → paste `supabase/migrations/0003_storage_buckets.sql` → **Run**. This creates the public `media` Storage bucket and its read/write policies.
5. New query → paste `supabase/seed.sql` → **Run**. This inserts the initial content (settings, experience, skills, projects, certifications) so the database isn't empty.

> Run them strictly in the order **0001 → 0002 → 0003 → seed**. Later scripts depend on tables and the `is_admin()` function created earlier. Each script is safe to re-run (they use `if not exists`, `on conflict do nothing`, and `drop policy if exists`), but `seed.sql` will skip the `settings` row on re-run and may insert duplicate rows for other tables, so prefer running `seed.sql` exactly once.

#### What each migration creates

**`0001_init_schema.sql`**
- Enables the `pgcrypto` extension (for `gen_random_uuid()`).
- Creates tables: `profiles`, `projects`, `experience`, `skills`, `certifications`, `settings`.
- `profiles.id` references `auth.users(id)` — every login maps 1:1 to a profile row.
- `profiles.role` is `'viewer'` by default with a check constraint allowing only `'admin'` or `'viewer'`.
- `settings` is a **single-row table** (primary key forced to `id = 1`).
- Adds `handle_new_user()` + an `on_auth_user_created` trigger so a `profiles` row is auto-created on signup.

**`0002_rls_policies.sql`**
- Enables RLS on all six tables.
- Creates `is_admin()` — a `security definer` function that returns true if the current user's `profiles.role = 'admin'`.
- `profiles`: public **read**; a user may **update** their own row, and admins may update any row.
- `projects`, `experience`, `skills`, `certifications`, `settings`: public **read**; **all writes** (insert/update/delete) require `is_admin()`.

**`0003_storage_buckets.sql`**
- Creates a **public** Storage bucket `media`.
- Policies: anyone may **read** objects in `media`; only admins may **insert/update/delete**.

### 4.3 Creating storage buckets

The `media` bucket is created automatically by `0003_storage_buckets.sql`. To verify:

1. Left sidebar → **Storage**.
2. You should see a bucket named **`media`** marked **Public**.
3. If it's missing, re-run `supabase/migrations/0003_storage_buckets.sql` in the SQL Editor.

Uploaded images are stored under an `uploads/` prefix (e.g. `uploads/1716900000000-photo.webp`). The CMS Media Library lists exactly this prefix.

### 4.4 Configuring RLS policies

RLS is configured entirely by `0002` and `0003`. You normally don't touch it by hand. To **inspect** the policies:

1. Left sidebar → **Authentication → Policies** (for table policies) or **Storage → Policies**.
2. You should see, per content table, a `… read` policy (`using true`) and a `… write` policy (`using is_admin()`).

To **verify** RLS actually blocks anonymous writes (a good sanity check), run this in the SQL Editor — it should **fail** with a policy violation, which is correct:

```sql
-- Expected to FAIL (no admin session in the SQL editor's anon context):
-- This confirms RLS is protecting writes.
insert into public.skills (category, name, full_name, color, sort_order)
values ('stack', 'Test', 'Test', '#000000', 99);
```

> If that insert *succeeds*, RLS is not enabled correctly — re-run `0002_rls_policies.sql`.

### 4.5 Creating an admin account

There is **no public sign-up UI** in this app — you create the user in the Supabase dashboard.

1. Left sidebar → **Authentication → Users → Add user → Create new user**.
2. Enter the **email** and a **password** you'll use to log into the CMS.
3. Tick **Auto Confirm User** (so you don't need an email-verification step).
4. Click **Create user**.
5. The `on_auth_user_created` trigger automatically inserts a matching row into `public.profiles` with `role = 'viewer'`.

### 4.6 Setting `role = 'admin'`

The new user is a `viewer` and **cannot edit content yet**. Promote them:

1. SQL Editor → New query.
2. Run (replace the email with the one you just created):

```sql
update public.profiles
set role = 'admin'
where email = 'you@example.com';
```

3. Confirm it worked:

```sql
select id, email, role from public.profiles;
```

You should see your email with `role = admin`.

> If the `profiles` row doesn't exist (e.g. the trigger didn't fire because the user predates the migration), create it manually:
> ```sql
> insert into public.profiles (id, email, role)
> select id, email, 'admin' from auth.users where email = 'you@example.com'
> on conflict (id) do update set role = 'admin';
> ```

### 4.7 Testing CMS connectivity

1. Make sure `.env.local` has your real `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Section 3).
2. Restart the dev server: `npm run dev`.
3. Go to **http://localhost:5173/admin/login**.
4. Enter the admin email + password → **Sign in**.
5. On success you land on the **Dashboard** with non-zero counts (because `seed.sql` populated the tables).
6. Open **Projects** → click **Edit** on a row → change the title → **Save**. Then open the public site (`/`) and confirm the change appears (the public query cache refreshes on save).

If sign-in fails or you see a "not an admin" message, jump to [4.8](#48-troubleshooting-common-supabase-errors).

### 4.8 Troubleshooting common Supabase errors

| Error / symptom | Likely cause | Fix |
|---|---|---|
| `/admin` says "Supabase isn't configured" | Env vars missing or dev server not restarted | Set both `VITE_*` vars in `.env.local`, restart `npm run dev` |
| Login: `Invalid login credentials` | Wrong email/password, or user not confirmed | Re-check credentials; in dashboard ensure the user is **confirmed** (re-create with Auto Confirm) |
| Logged in but "Your account isn't an admin." | `profiles.role` is still `'viewer'` | Run the `update … set role='admin'` query in 4.6 |
| Saving a project errors with `new row violates row-level security policy` | Your session isn't recognized as admin | Confirm `is_admin()` returns true: `select public.is_admin();` while logged in via the app; verify `profiles.role='admin'` for your `auth.uid()` |
| Dashboard counts are all 0 | `seed.sql` not run, or run before tables existed | Re-run `supabase/seed.sql` after `0001`–`0003` |
| Image upload fails with a policy error | Storage policies missing, or not admin | Re-run `0003_storage_buckets.sql`; confirm admin role |
| Uploaded images don't display | Bucket not public, or wrong path | Storage → confirm `media` is **Public**; the app builds URLs via `supabase.storage.from('media').getPublicUrl(path)` |
| `relation "public.profiles" does not exist` | Migrations not run / wrong order | Run `0001` first, then `0002`, `0003`, `seed` |
| CORS or network errors in console | Wrong project URL | Re-copy **Project URL** from Settings → API (no trailing slash, `https://` included) |

---

## 5. CMS User Manual

Open the CMS at `/admin` and sign in. The left sidebar (`AdminLayout.tsx`) lists every section. All CRUD sections share the same two building blocks:

- **`DataTable`** (`src/admin/components/DataTable.tsx`) — the list with a `+ New` button and per-row **Edit** / **Delete** buttons. Delete shows a browser confirm dialog.
- **`FormDrawer`** (`src/admin/components/FormDrawer.tsx`) — a slide-over panel with the form fields and **Cancel** / **Save** buttons.

Saving any item invalidates both the admin list cache and the public `site-content` cache, so the live site updates without a manual refresh.

> **HTML-allowed fields:** Several text fields are rendered with `dangerouslySetInnerHTML` on the public site (profile subtitle, about paragraphs, project descriptions, the commendation). You can use simple tags like `<b>`, `<em>`, and `<span class="m">…</span>` (the latter renders as a highlighted metric). Because these render as raw HTML, **only the trusted admin should edit them** — never paste untrusted HTML.

### 5.1 Profile  (`admin/pages/Profile.tsx`)

**Controls on the website:** the Hero section headline/lede/roles + résumé link, and the entire About section (paragraphs, about photo, optional hero photo). It edits the **single** `profiles` row belonging to your logged-in user.

| Field | Maps to | Notes |
|---|---|---|
| Name | Hero intro "Hi, I'm **{name}**." | Plain text |
| Title (hero headline) | `profiles.title` | Used as the stored headline (the visible split-hero `<h1>` is a styled fixed string; see Known Limitations) |
| Subtitle / lede (HTML allowed) | Hero split-layout lede paragraph | `<b>`, `<em>` etc. allowed |
| Typewriter roles (comma-separated) | The cycling role text under the hero headline | e.g. `Full-Stack Engineer, Agentic-AI Developer` |
| Résumé URL | Nav "Résumé" button + hero | Opens in a new tab when set |
| About paragraphs (blank line between, HTML allowed) | About-section body paragraphs | **Separate paragraphs with a blank line** (the code splits on `\n\n`) |
| About image | About section photo (right) | Uploads to Storage; stores the path |
| Hero image (optional) | Replaces the hero code card with a photo | Leave blank to keep the code card |

- **Add / Edit:** there is no "new" here — it's a single record. Change fields, click **Save**. You'll get a "Saved." alert.
- **Delete:** not applicable (a profile always exists for your user).
- **Best practices:** keep the lede to 1–2 sentences; use 2–4 about paragraphs; upload photos through the field (don't paste external hotlinks unless intentional).

### 5.2 Projects  (`admin/pages/Projects.tsx`)

**Controls:** the "Selected work" section cards.

| Field | Notes |
|---|---|
| Title | Card heading |
| Slug | **Unique** short identifier (DB has a `unique` constraint). Use lowercase-with-hyphens, e.g. `medbot` |
| Date label | Free text shown as the date, e.g. `Apr 2026` |
| Description (HTML allowed) | Use `<span class="m">90% task success</span>` for highlighted metrics |
| Tech stack (comma-separated) | Renders as chips |
| GitHub URL / Live URL | Open in new tabs |
| Featured | Checkbox → shows a "Featured" badge |
| Preview image | Uploaded to Storage |

- **Add:** click **+ New**, fill the drawer, **Save**. New items get the next `sort_order` automatically.
- **Edit:** click **Edit** on a row, change fields, **Save**.
- **Delete:** click **Delete**, confirm. (Permanent.)
- **Ordering:** cards render by `sort_order` ascending. To reorder, edit the items so their order matches the desired sequence (there's no drag-reorder UI yet — see Known Limitations).
- **Best practices:** keep slugs unique; size preview images reasonably (the uploader downscales to ≤1400px). Always supply a Live URL or it will link to an empty string.

### 5.3 Experience  (`admin/pages/Experience.tsx`)

**Controls:** the pinned horizontal Experience rail cards.

| Field | Notes |
|---|---|
| Step label | The small pill above the role, e.g. `Currently shipping` |
| Role | Card heading |
| Company / org | Sub-heading line |
| Duration | e.g. `Jul 2025 — Present · Kolkata` |
| Description | Body text (plain) |
| Tags (comma-separated) | Rendered as small tag chips |

- Add / Edit / Delete work the same as Projects.
- **Note:** the DB also has an `achievements` array column, but it is **not** surfaced in the current form or the public component (see Known Limitations).
- **Best practices:** keep descriptions to 2–3 sentences so cards stay even in height; use a consistent duration format.

### 5.4 Skills  (`admin/pages/Skills.tsx`)

**Controls:** the floating bubbles in the Tech Stack section.

| Field | Notes |
|---|---|
| Short label (bubble) | The text inside the bubble. The bubble shows only the **first 5 characters** — keep it short (e.g. `React`, `Lang`) |
| Full name | Shown on hover, e.g. `LangGraph` |
| Accent color (hex) | The bubble's label color, e.g. `#61DAFB` |
| Category | Currently always `stack` (kept for future grouping) |

- Add / Edit / Delete as above; bubbles are positioned on an arc by `sort_order`.
- **Best practices:** 12–16 skills look best on the arc; pick brand-accurate hex colors; remember only the first 5 chars of the short label appear in the bubble.

### 5.5 Certifications  (`admin/pages/Certifications.tsx`)

**Controls:** the "Recognitions & certificates" carousel and its modal lightbox.

| Field | Notes |
|---|---|
| Title | Card heading |
| Issuer | e.g. `Rajya Sainik Board` |
| Date label | e.g. `2025` |
| Description | Shown in the details panel + modal |
| Certificate image | Uploaded to Storage; shown in card + lightbox |

- Add / Edit / Delete as above.
- **Best practices:** upload landscape certificate scans; keep titles short enough to fit the card; the carousel handles any count, but 3–6 reads cleanly.

### 5.6 Contact  (`admin/pages/Contact.tsx`)

**Controls:** the Contact section's email/links and photo. Edits the single `settings` row (`id = 1`) via **upsert**.

| Field | Maps to | Notes |
|---|---|---|
| Email | "mailto:" button + footer reach | Primary CTA |
| Phone | `settings.phone` | Stored; not currently rendered in the public Contact UI |
| LinkedIn URL | "LinkedIn ↗" button | |
| GitHub URL | "GitHub ↗" button | |
| Contact image | Contact section photo (right) | Uploaded to Storage |

- It's a single record: change fields → **Save** → "Saved." alert. No add/delete.

### 5.7 SEO  (`admin/pages/Seo.tsx`)

**Controls:** the document `<head>` tags rendered by `components/layout/Seo.tsx`. Also edits the `settings` row via **upsert**.

| Field | Maps to |
|---|---|
| Title tag | `<title>` + `og:title` |
| Meta description | `<meta name="description">` + `og:description` |
| Keywords (comma-separated) | `<meta name="keywords">` |

- Single record; **Save** to apply. Changes take effect on the next public page load.
- **Best practices:** title ≤ ~60 chars, description ~150–160 chars, a handful of relevant keywords.

### 5.8 Media Library  (`admin/pages/MediaLibrary.tsx`)

**Controls:** the files in the Storage `media/uploads` folder. This is a file manager, not a content section by itself.

- **Upload:** use the uploader at the top. Files are downscaled to ≤1400px WebP in the browser before upload.
- **Copy path:** copies the storage path (e.g. `uploads/1716...-photo.webp`) to your clipboard so you can paste it into a field if needed.
- **Delete:** removes the file from Storage (confirm dialog). **Deleting a file that's still referenced by a project/cert will cause a broken image** on the site — update or remove the reference first.
- **Best practices:** prefer uploading images directly from the relevant section's image field (Profile, Projects, etc.), which both uploads *and* wires up the reference. Use the Media Library mainly to audit/clean up.

---

## 6. Content Management Workflow

Concrete recipes. All assume you're logged into `/admin` as an admin.

### Change hero content

1. **Profile** → edit **Name**, **Subtitle / lede**, and **Typewriter roles**.
2. To change the rotating roles, edit the comma-separated **roles** field, e.g. `Full-Stack Engineer, RAG Developer, CV Builder`.
3. **Save** → reload `/` to confirm the typewriter and lede updated.

### Replace profile photo

- **About photo:** Profile → **About image** field → choose a file → it uploads and previews → **Save**.
- **Hero photo (optional):** Profile → **Hero image** field → upload a portrait → **Save**. This **replaces the code card** in the hero split with your photo. Leave blank to keep the code card.

### Add a project

1. **Projects** → **+ New**.
2. Fill **Title**, a **unique Slug**, **Date label**, **Description** (use `<span class="m">metric</span>` for highlights), **Tech stack**, **GitHub URL**, **Live URL**.
3. Tick **Featured** if it should show the badge.
4. **Preview image** → upload.
5. **Save** → it appears in "Selected work."

### Add experience entries

1. **Experience** → **+ New**.
2. Fill **Step label**, **Role**, **Company / org**, **Duration**, **Description**, **Tags**.
3. **Save** → it appears in the Experience rail. New entries sort to the end; edit `sort_order`-affecting order by re-sequencing if needed.

### Upload certification images

1. **Certifications** → **+ New** (or **Edit** an existing one).
2. Fill **Title**, **Issuer**, **Date label**, **Description**.
3. **Certificate image** → upload the scan/screenshot.
4. **Save** → it appears in the carousel; click a card on the site to open the lightbox.

### Update contact information

1. **Contact** → edit **Email**, **LinkedIn URL**, **GitHub URL** (and **Phone** if you later surface it).
2. Optionally replace the **Contact image**.
3. **Save** → the Contact section buttons update.

### Update SEO metadata

1. **SEO** → edit **Title tag**, **Meta description**, **Keywords**.
2. **Save** → reload `/`; view source or use browser dev tools to confirm the `<title>` and meta tags.

---

## 7. Production Build Process

### How to build

```bash
npm run build
```

This runs two steps (see `package.json` → `scripts.build`):

1. **`tsc -b`** — TypeScript type-checks the whole project. Any type error **fails the build** (good — it catches mistakes before deploy).
2. **`vite build`** — bundles and minifies into the `dist/` folder.

A successful build looks like this (verified):

```
vite v5.4.21 building for production...
✓ 167 modules transformed.
dist/index.html                   0.77 kB │ gzip:   0.45 kB
dist/assets/index-*.css          37.25 kB │ gzip:   7.95 kB
dist/assets/index-*.js          486.54 kB │ gzip: 139.93 kB
✓ built in ~4s
```

### How to preview production locally

```bash
npm run preview
```

This serves the built `dist/` folder locally (Vite prints the URL, typically http://localhost:4173). Use it to sanity-check the production bundle before deploying. **Set your env vars first** (Vite inlines `VITE_*` values at build time, so a build made without env vars will have no Supabase connection even in preview).

### Build output explanation

```
dist/
├── index.html              # Entry HTML with hashed asset links
├── assets/
│   ├── index-<hash>.css    # All CSS (globals + admin), minified (~37 KB / ~8 KB gzip)
│   └── index-<hash>.js      # All JS in one chunk (~487 KB / ~140 KB gzip)
└── images/
    ├── about2.webp
    ├── tech5.webp
    └── getintouch5.webp     # public/ assets copied verbatim
```

- Filenames are **content-hashed** for cache-busting.
- The entire app (public + admin) ships in **one JS chunk** — there is currently no code-splitting, so visiting `/` still downloads the admin code. See Known Limitations for how to split it.

### Performance notes

- The single JS bundle is ~140 KB gzipped — acceptable, but it crosses Vite's soft "chunk size" awareness. Code-splitting the `/admin` route (via `React.lazy`) would shrink the public payload.
- Images are WebP and lazy-loaded (`loading="lazy"`) in sections; the in-browser uploader downscales new uploads to ≤1400px WebP at quality 0.85.
- Fonts load from Google Fonts CDN with `preconnect` hints in `index.html`.
- Scroll animations use `requestAnimationFrame` and `passive` listeners, and the hero respects `prefers-reduced-motion`.

### Deployment checklist

- [ ] `npm run build` passes locally with **zero** TypeScript errors.
- [ ] `.env`/host env has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (anon key only).
- [ ] Supabase migrations `0001`–`0003` + `seed.sql` have been run on the production project.
- [ ] An **admin** user exists (`profiles.role='admin'`).
- [ ] SPA routing/rewrites are configured so `/admin/*` serves `index.html` (see each host below).
- [ ] `media` Storage bucket is **Public** and reachable.
- [ ] Test `/admin/login` on the deployed URL after first deploy.
- [ ] Confirm public site renders even if you temporarily blank env vars (seed fallback).

---

## 8. Deployment Guides

> **Universal facts.** Build command: `npm run build`. Output directory: `dist`. Required build-time env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Because this is a client-side SPA with client routing, **every host must rewrite unknown paths to `/index.html`** or deep links like `/admin/projects` will 404 on refresh.

### A. Vercel Deployment

The repo already includes `vercel.json` with the SPA rewrite:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

**Step-by-step**

1. Push the project to a GitHub/GitLab/Bitbucket repo.
2. Go to **https://vercel.com → Add New → Project** and import the repo.
3. Vercel auto-detects Vite. Confirm:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Expand **Environment Variables** and add (for Production, Preview, and Development as desired):
   - `VITE_SUPABASE_URL` = your project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
5. Click **Deploy**. After it finishes, open the URL and test `/admin/login`.

**Environment variables:** set in **Project → Settings → Environment Variables**. Re-deploy after changing them (Vite inlines them at build time).

**Domain setup:** Project → **Settings → Domains** → add your custom domain → follow the DNS instructions (CNAME to `cname.vercel-dns.com` or A records as shown). HTTPS is automatic.

**Common issues**

| Issue | Fix |
|---|---|
| `/admin/projects` 404s on refresh | Ensure `vercel.json` is committed (it provides the rewrite) |
| CMS can't connect after deploy | Env vars missing/typo'd → set them and **redeploy** |
| Old content after editing env | Vite inlines env at build — trigger a fresh deploy |

### B. Netlify Deployment

Netlify needs a redirect rule (the repo doesn't include one — add it).

**Add SPA redirect.** Create a file `public/_redirects` with this single line (it gets copied into `dist/`):

```
/*    /index.html   200
```

(Alternatively create `netlify.toml` at the repo root with a `[[redirects]]` block to the same effect.)

**Step-by-step**

1. Push to a Git provider.
2. **https://app.netlify.com → Add new site → Import an existing project** → pick the repo.
3. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. **Site configuration → Environment variables** → add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5. **Deploy site.** Test `/admin/login` on the Netlify URL.

**Domain setup:** Site configuration → **Domain management → Add a domain** → update DNS (CNAME to your Netlify subdomain, or use Netlify DNS). HTTPS via Let's Encrypt is automatic.

**Common issues**

| Issue | Fix |
|---|---|
| Routes 404 on refresh | Missing `_redirects` (or `netlify.toml`) — add the `/* /index.html 200` rule |
| Env vars not applied | Set them, then **Clear cache and deploy site** |
| Build fails on type error | Fix the TS error locally (`npm run build`) and push |

### C. Cloudflare Pages Deployment

**Step-by-step**

1. Push to a Git provider.
2. **Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git** → select the repo.
3. Build settings:
   - **Framework preset:** Vite (or None)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. **Environment variables** (Settings → Environment variables, set for Production and Preview):
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
5. **Save and Deploy.**

**SPA routing on Cloudflare Pages:** Pages serves `index.html` for unmatched routes automatically when there's no conflicting file, so deep links generally work. If you ever hit 404s on deep links, add a `public/_redirects` file with:

```
/*    /index.html   200
```

**Domain setup:** Pages project → **Custom domains → Set up a custom domain** → if your DNS is on Cloudflare it's one click; otherwise add the shown CNAME. HTTPS is automatic.

**Common issues**

| Issue | Fix |
|---|---|
| Deep-link 404s | Add `public/_redirects` with the SPA fallback |
| Node version mismatch | Set a `NODE_VERSION` env var (e.g. `20`) in Pages settings |
| Env vars missing at runtime | They're build-time only — set them and redeploy |

### D. VPS Deployment (Ubuntu + Nginx)

This is a **static site** — you build it once and let Nginx serve the `dist/` folder. PM2 is **not required** (there's no Node server to keep alive); it's only useful if you instead want to run `vite preview` as a long-lived process, which is not recommended for production. Both paths are shown.

#### D.1 Provision and build

```bash
# On the server (Ubuntu 22.04+)
sudo apt update && sudo apt upgrade -y

# Install Node 20 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx

node --version   # v20.x
nginx -v

# Get the code
cd /var/www
sudo git clone <YOUR_REPO_URL> nayani-portfolio
sudo chown -R $USER:$USER nayani-portfolio
cd nayani-portfolio

# Provide env vars for the build
cat > .env.local <<'ENV'
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
ENV

npm install
npm run build         # produces /var/www/nayani-portfolio/dist
```

#### D.2 Nginx configuration (recommended: serve static `dist/`)

Create `/etc/nginx/sites-available/nayani-portfolio`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/nayani-portfolio/dist;
    index index.html;

    # SPA fallback: send unknown routes to index.html so /admin/* works
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Long-cache hashed assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/css application/javascript image/svg+xml;
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/nayani-portfolio /etc/nginx/sites-enabled/
sudo nginx -t          # test config
sudo systemctl reload nginx
```

#### D.3 SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
# Choose redirect-to-HTTPS when prompted.

# Auto-renewal is installed as a systemd timer; verify with:
sudo certbot renew --dry-run
```

#### D.4 (Optional) PM2 — only if running `vite preview` as a service

> Not recommended for production (the static-Nginx approach above is simpler and faster). Included for completeness.

```bash
sudo npm install -g pm2
# Serve the built app on port 4173:
pm2 start "npm run preview -- --host --port 4173" --name nayani-portfolio
pm2 save
pm2 startup        # follow the printed command to enable on boot
```

Then point Nginx as a reverse proxy to `http://127.0.0.1:4173` instead of serving files directly. For a static site you usually **don't need this**.

#### D.5 Redeploying on a VPS

```bash
cd /var/www/nayani-portfolio
git pull
npm install
npm run build
sudo systemctl reload nginx   # static files are now updated; no restart needed
```

**Common issues**

| Issue | Fix |
|---|---|
| `/admin/*` 404 on refresh | Ensure the `try_files … /index.html;` SPA fallback is present |
| Site shows old build | Re-run `npm run build`; hashed assets bust caches automatically |
| 403 / permission denied | `sudo chown -R www-data:www-data dist` or ensure Nginx can read the path |
| CMS can't reach Supabase | The `.env.local` used at **build time** had wrong/missing keys — rebuild |
| Cert renewal failed | `sudo certbot renew --dry-run`; ensure port 80 is open for the HTTP-01 challenge |

---

## 9. Maintenance Guide

### Updating dependencies

```bash
# See what's outdated
npm outdated

# Update within the semver ranges in package.json
npm update

# After any update, ALWAYS verify the build:
npm run build
npm run preview     # smoke-test the app
```

For **major** version bumps (e.g. React 18 → 19, Vite 5 → 6), upgrade one library at a time, read its migration notes, and re-test. Commit `package-lock.json` so deploys are reproducible.

### Backing up the database

Use the Supabase dashboard or `pg_dump`:

- **Dashboard:** Project → **Database → Backups** (managed daily backups on paid plans). For a manual snapshot, **Database → Backups → … (or use the connection string with pg_dump)**.
- **`pg_dump` (manual, recommended before risky changes):**
  ```bash
  # Connection string from Supabase: Project Settings → Database → Connection string
  pg_dump "postgresql://postgres:[PASSWORD]@db.YOUR-REF.supabase.co:5432/postgres" \
    --schema=public --no-owner --no-privileges -f backup_$(date +%F).sql
  ```
- **Quick content-only export:** in the SQL Editor you can `select * from public.<table>` and export to CSV per table.

### Backing up storage

The `media` bucket holds your uploaded images. To back them up, either:

- Download via the Storage UI (Storage → `media` → select files → download), or
- Script it with the Supabase JS/CLI (list objects under `uploads/` and download each), or
- Use the Supabase CLI `supabase storage` commands if you adopt the CLI.

Keep a copy of original-resolution images **outside** Supabase too, since the in-app uploader stores downscaled WebP versions.

### Updating content safely

- Make content edits through the **CMS**, not by editing the database directly, so RLS and validation behave normally.
- Before bulk changes, **back up** (above).
- After editing, verify the public site (`/`) reflects the change. The app invalidates caches on save; a hard refresh confirms persistence.
- Avoid deleting Media Library files that are still referenced — update the referencing item first.

### Monitoring errors

- **Browser console** is the first stop for client errors (the app logs `"Supabase fetch failed, using seed content."` when a fetch fails).
- **Supabase → Logs** (API / Auth / Storage logs) shows backend-side errors, failed auth, and RLS denials.
- **Host dashboards** (Vercel/Netlify/Cloudflare) show build logs and function/edge logs.
- Consider adding an error-reporting service (e.g. Sentry) for production if traffic grows — not currently integrated.

---

## 10. Troubleshooting

### Build failures

| Symptom | Cause | Fix |
|---|---|---|
| `npm run build` fails at `tsc -b` | A TypeScript type error | Read the error's file:line; fix the type. The build intentionally blocks on type errors |
| Build fails on the host but passes locally | Different Node version | Pin Node (e.g. `NODE_VERSION=20` on the host) to match local |
| "Cannot find module" during build | Corrupt `node_modules` | `rm -rf node_modules package-lock.json && npm install` |

### TypeScript errors

- `tsconfig.json` runs in **strict** mode. If you add code, annotate types. Common fixes: give state an explicit type, guard `null` (e.g. `supabase!` is used because the admin code only runs when Supabase is enabled), and import `type` for type-only imports.
- The admin pages use `any` for DB rows in a few places; if you tighten these, update the corresponding `interface Row` definitions.

### Missing images

- **Project preview / certificate images don't show.** The seed references paths like `/images/medbot.png` and `/certificates/commendation.png` that **do not exist** in `public/` (only `about2.webp`, `tech5.webp`, `getintouch5.webp` ship). This is expected until you upload real images via the CMS. Every `<img>` is built to hide on error so the layout stays intact.
- **Uploaded image doesn't render.** Confirm the `media` bucket is **Public**; confirm the stored path is correct; check the Network tab for a 400/403 (often an RLS/policy issue).

### Supabase connection issues

- CMS says "not configured" → env vars missing; set them and restart/redeploy.
- `fetchSiteContent` warns and falls back to seed → check the Network tab for the failing Supabase request; verify the URL and anon key.
- CORS errors → almost always a wrong project URL.

### Login problems

| Symptom | Fix |
|---|---|
| "Invalid login credentials" | Wrong password, or user not confirmed in Supabase. Re-create with **Auto Confirm** |
| Logs in but "isn't an admin" | `profiles.role` not `'admin'` → run the promote query (Section 4.6) |
| Login button disabled | Supabase not configured (`enabled` is false) → set env vars |
| Session doesn't persist | Browser blocking storage; the client uses `persistSession: true` — check that localStorage isn't disabled |

### Storage upload failures

| Symptom | Fix |
|---|---|
| Upload alert shows a policy error | You're not recognized as admin → fix role; ensure `0003` policies exist |
| Upload silently does nothing | `supabase` client is null (env missing) → configure env |
| Huge upload / slow | The uploader downscales >1400px images automatically; very large files still take time |

### Environment variable mistakes

- Variable **not** prefixed with `VITE_` → it won't reach the browser. Both must be `VITE_*`.
- Trailing slash or quotes in the URL → remove them.
- Edited `.env.local` but nothing changed → **restart** the dev server / **redeploy** the host (Vite inlines env at build/startup).
- Accidentally used the `service_role` key → **rotate it immediately** in Supabase and replace with the anon key.

### Deployment failures

- Routes 404 on refresh → SPA fallback/rewrite missing (see each host in Section 8).
- CMS works locally but not deployed → env vars not set on the host, or set after the last build (redeploy).
- Build OK but blank page → check the browser console; often a wrong base path or a runtime error from a missing env value.

---

## 11. Future Development Guide

Where to make common changes:

| You want to change… | Edit here |
|---|---|
| **Global styling / colors / fonts** | `src/styles/globals.css` — design tokens live in the `:root[data-theme="light"]` and `[data-theme="dark"]` blocks (`--paper`, `--ink`, `--accent`, fonts under `:root`). Fonts are linked in `index.html`. |
| **Admin/CMS styling** | `src/styles/admin.css` (reuses the same tokens) |
| **Animations** | The hooks in `src/hooks/`: `useHeroMorph.ts` (hero morph timing/thresholds), `usePinnedExperience.ts` (rail scroll math), `useTechBubbles.ts` (bubble arc placement/animation), `useReveal.ts` (reveal threshold), `useScrollSpy.ts` (active-section logic). CSS transitions/keyframes are in `globals.css`. |
| **Hero section** | Markup/typewriter in `src/components/sections/Hero.tsx`; scroll behavior in `src/hooks/useHeroMorph.ts`; styles under the hero selectors in `globals.css`. |
| **Experience section** | `src/components/sections/Experience.tsx` + `src/hooks/usePinnedExperience.ts`; mobile breakpoint is `≤760px`. |
| **Projects section** | `src/components/sections/Projects.tsx` (cards) and the admin form in `src/admin/pages/Projects.tsx`. |
| **CMS forms** | Each page in `src/admin/pages/*`; shared form UI in `src/admin/components/FormDrawer.tsx` (and `Field`), tables in `DataTable.tsx`, image upload in `ImageUploader.tsx`. |
| **Database schema** | Add a new migration file under `supabase/migrations/` (e.g. `0004_*.sql`). Mirror new columns in `src/lib/types.ts`, the mapping in `src/lib/queries.ts`, the `SEED` in `src/lib/content.ts`, and the relevant admin page. Add/adjust RLS in the same migration. |

**Adding a new content field end-to-end (example):**
1. Migration: `alter table public.projects add column repo_stars int default 0;`
2. `src/lib/types.ts`: add `repoStars: number` to `Project`.
3. `src/lib/queries.ts`: map `repoStars: r.repo_stars ?? 0` in the projects mapper.
4. `src/lib/content.ts`: add `repoStars` to each seed project.
5. `src/admin/pages/Projects.tsx`: add it to `interface Row`, `empty`, and a `<Field>` in the drawer.
6. `src/components/sections/Projects.tsx`: render it.

**Adding code-splitting for the admin route (perf win):**
- In `src/App.tsx`, lazy-load `AdminApp` with `React.lazy` + `<Suspense>` so the public bundle doesn't include CMS code.

---

## 12. Architecture Deep Dive

### Data flow

```mermaid
sequenceDiagram
    participant U as User (browser)
    participant H as Home.tsx
    participant UC as useContent()
    participant RQ as React Query
    participant Q as fetchSiteContent()
    participant SB as Supabase (Postgres)
    participant S as SEED (content.ts)

    U->>H: visit "/"
    H->>UC: read content
    UC->>RQ: useQuery(["site-content"])
    RQ->>Q: queryFn()
    alt Supabase configured & reachable
        Q->>SB: 6 parallel selects (profiles, projects, ...)
        SB-->>Q: rows (RLS: public read OK)
        Q-->>RQ: mapped SiteContent (per-field SEED fallback)
    else not configured / error / empty
        Q-->>RQ: SEED
    end
    RQ-->>UC: data (or SEED while loading)
    UC-->>H: { content }
    H-->>U: rendered sections
```

The public site **always has content to show**: `useContent()` returns `SEED` until React Query resolves, and `fetchSiteContent()` falls back to `SEED` on any failure or empty table — even per-field (e.g. a null `title` falls back to the seed title).

### React component hierarchy

```mermaid
flowchart TD
    App["App.tsx<br/>HelmetProvider + QueryClientProvider + BrowserRouter"]
    App --> Home["/ → Home.tsx"]
    App --> AdminApp["/admin/* → AdminApp.tsx"]
    App --> NF["* → NotFound.tsx"]

    Home --> Seo["Seo"]
    Home --> Nav["Nav (useScrollSpy, useTheme)"]
    Home --> Hero["Hero (useHeroMorph, typewriter)"]
    Home --> About["About → PhotoPanel"]
    Home --> Exp["Experience (usePinnedExperience)"]
    Home --> Stack["Stack (useTechBubbles)"]
    Home --> Proj["Projects"]
    Home --> Certs["Certs (carousel + modal)"]
    Home --> Contact["Contact → PhotoPanel"]
    Home --> Footer["Footer"]

    AdminApp --> AuthP["AuthProvider"]
    AuthP --> LoginR["login → Login"]
    AuthP --> Guard["ProtectedRoute → AdminLayout"]
    Guard --> Dash["Dashboard"]
    Guard --> PProfile["Profile"]
    Guard --> PProjects["Projects (DataTable + FormDrawer + ImageUploader)"]
    Guard --> PExp["Experience"]
    Guard --> PSkills["Skills"]
    Guard --> PCerts["Certifications"]
    Guard --> PContact["Contact"]
    Guard --> PSeo["SEO"]
    Guard --> PMedia["Media Library"]
```

### Custom hooks

| Hook | Responsibility |
|---|---|
| `useContent()` | React Query wrapper; returns `{ content, isLoading, error }`, defaulting to `SEED`. `staleTime` 60s. |
| `useHeroMorph()` | Returns refs for the hero/intro/split; computes scroll progress through the 200vh hero and drives opacity/transform of the two stages. Honors `prefers-reduced-motion`. |
| `usePinnedExperience(count)` | Returns refs for wrap/rail/dots; translates the rail horizontally based on vertical scroll progress and toggles the active card + progress dots. No-op ≤760px. |
| `useTechBubbles(skills)` | Returns refs for the scene/layer; positions bubbles on an arc around the photo and reveals them on scroll; repositions on resize. |
| `useReveal(deps)` | IntersectionObserver that adds `.in` to `.reveal`/`.reveal-stagger` elements; re-runs when `deps` change (so newly fetched content animates in). |
| `useScrollSpy()` | Tracks the active section id and whether the page is scrolled (for nav styling). |
| `useTheme()` | Reads/writes `localStorage("np-theme")`, sets `data-theme` on `<html>`, returns `{ theme, toggle }`. Defaults to OS preference. |

### Supabase integration

- **Single client** in `src/lib/supabaseClient.ts`: created only if **both** env vars exist (`supabaseEnabled`); otherwise `supabase` is `null` and the app uses seed/disables CMS. Uses **anon key**, `persistSession: true`, `autoRefreshToken: true`.
- **Reads** (`src/lib/queries.ts`): six parallel `select`s, ordered by `sort_order` where relevant; results mapped from snake_case DB columns to camelCase TS types, each field falling back to `SEED`.
- **Writes** (admin pages): direct `insert`/`update`/`upsert`/`delete` via the same client; allowed only because the logged-in admin's session passes the `is_admin()` RLS check.
- **`mediaUrl(pathOrUrl)`**: passes through absolute URLs and `/`-rooted static paths; otherwise resolves a Storage path to a public URL via `getPublicUrl`.

### Authentication flow

```mermaid
sequenceDiagram
    participant U as Admin user
    participant L as Login.tsx
    participant AC as AuthContext
    participant SB as Supabase Auth
    participant DB as profiles table

    U->>L: enter email + password
    L->>AC: signIn(email, password)
    AC->>SB: signInWithPassword
    SB-->>AC: session (or error)
    AC->>DB: select role where id = auth.uid()
    DB-->>AC: role
    AC-->>L: session set; isAdmin = (role === 'admin')
    Note over L: ProtectedRoute now allows admin pages
    U->>L: navigate to /admin/projects
    Note over AC: onAuthStateChange keeps session + isAdmin in sync
```

- `ProtectedRoute` blocks rendering until `loading` resolves, redirects to `/admin/login` if no session, and shows a "not an admin" notice if `isAdmin` is false.
- The route guard is **UX only**; the *real* enforcement is RLS in the database — even a forged client cannot write without an admin session.

### Image upload flow

```mermaid
sequenceDiagram
    participant U as Admin
    participant IU as ImageUploader
    participant CV as Canvas (downscale)
    participant ST as Supabase Storage (media)
    participant F as Form field / DB

    U->>IU: choose file
    IU->>CV: downscale to <=1400px WebP (q0.85)
    CV-->>IU: Blob
    IU->>ST: upload uploads/<timestamp>-<name>
    ST-->>IU: ok (RLS: admin write)
    IU->>F: onChange(storagePath)
    Note over F: path saved on the record;<br/>public site resolves it via mediaUrl()
```

- The DB stores the **path** (e.g. `uploads/171...-photo.webp`), not a full URL. `mediaUrl()` resolves it to a public URL at render time, so the same record works across environments.

---

## 13. Appendix: Known Limitations & Technical Debt

Documenting these honestly so a new maintainer isn't surprised.

**Migration decisions (why things are the way they are).** This project is a deliberate migration of a single-file HTML portfolio (`legacy/original-portfolio.html`, ~1,840 lines) into a maintainable React + Vite + TS app with a CMS. Key intentional changes from the original:
- The original **sprite-character canvas engine** (~690 KB of base64) was **removed** and replaced by three optimized WebP photos (About, Tech Stack, Contact) — a large payload and complexity win.
- The hero's right side became an **on-brand code card** (or an optional uploaded photo) instead of the sprite.
- The Experience section's character column was removed so the rail spans full width.
- All content moved from hardcoded HTML into a **database-driven model with a typed seed fallback**, enabling the `/admin` CMS. The seed (`src/lib/content.ts`) is the faithful extraction of the original copy, doubling as both the DB seed source and the offline fallback.

**Known limitations / technical debt:**

1. **Missing media in the repo.** Seed data references `/images/medbot.png`, `/images/vision-assist.png`, etc., and `/certificates/*.png`, but only `about2.webp`, `tech5.webp`, `getintouch5.webp` ship in `public/`. Project/cert images will 404 until uploaded via the CMS. (Images hide on error, so layout is safe.)
2. **Single JS bundle (~140 KB gzip).** No code-splitting: visiting `/` downloads the admin code too. Lazy-loading `AdminApp` would fix this.
3. **`commendation` is not DB-editable.** `queries.ts` hardcodes `commendation: SEED.profile.commendation`, so editing it requires a code change despite the field existing on the type.
4. **Schema columns not surfaced in the UI:** `profiles.quick_facts`, `profiles.cta_primary`, `profiles.cta_ghost`, and `experience.achievements` exist in the DB and types but have **no admin form fields** (and `achievements` isn't rendered publicly). Quick facts/CTAs therefore come from the seed unless you add fields + mapping.
5. **Hero `title` mismatch.** The visible split-hero `<h1>` ("Building software people actually use.") is a fixed string in `Hero.tsx`; the editable `profiles.title` is stored but not shown there. Decide whether to wire it up or remove the field.
6. **`react-hook-form` + `zod` are installed but unused.** Admin forms use plain controlled state with no validation. Adding zod schemas would harden inputs (e.g. URL/email/hex validation).
7. **No automated tests, linting config, or CI** are included.
8. **Netlify redirect not bundled.** Only `vercel.json` ships; Netlify/Cloudflare deep-link fallback requires adding `public/_redirects` (documented in Section 8).
9. **HTML-injection fields.** Several fields render via `dangerouslySetInnerHTML`. Safe under single-trusted-admin use, but if you ever add more editors, sanitize input.
10. **`settings.phone`** is editable in the CMS but not rendered anywhere on the public Contact section.

