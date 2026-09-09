# Nayani Paul — Portfolio (React + Vite + TypeScript + Supabase CMS)

A single-page portfolio with a sticky, retractable profile sidebar and a
self-managed **Supabase CMS** at `/admin` — every piece of content (profile,
experience, skills, projects, certificates, contact info, and which sections
show and in what order) is editable from the browser, no redeploy required.

## Quick start

```bash
npm install
cp .env.example .env      # optional — the site runs on seed content without it
npm run dev                # http://localhost:5173   (CMS at /admin)
```

The site renders fully from built-in seed content (`src/lib/content.ts`)
**without** Supabase configured. Add env vars and run the migrations below to
make everything editable from the CMS instead.

## Environment variables

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-PUBLIC-KEY
```

Anon key only — never put the `service_role` key in the frontend. Public
reads are enforced by Row Level Security; only an authenticated admin can
write.

## Supabase setup

1. Create a project at supabase.com and copy the **Project URL** and **anon
   public key** into `.env`.
2. In the SQL editor, run every file in `supabase/migrations/` in numeric
   order (`0001` → `0012`), then `supabase/seed.sql`.
3. Create your admin account: **Authentication → Users → Add user**, then in
   the SQL editor:
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'you@example.com');
   ```
4. Log in at `/admin/login`. Forgot your password later? Use the "Forgot
   password?" link there — it emails a reset link via Supabase Auth.

## Page structure

- **Sidebar** (sticky, retractable via the toggle handle) — photo, name,
  rotating role titles, info facts (school/location/GPA, each with its own
  emoji), an availability-status pill, and icon-only links (LinkedIn, GitHub,
  email, and a location pin that opens Google Maps).
- **About** — plain-text bio paragraphs plus an optional highlight card.
- **Experience** — a vertical chronological timeline (newest start-date
  first, computed automatically from each entry's date, not manual
  ordering), with a company logo/initials badge, tags, and a scroll-drawn
  connecting line.
- **Skills** — a single auto-scrolling marquee of tech-logo bubbles; hover
  shows the tool name.
- **Projects** — top 3 (featured-first) on the homepage with a link to the
  full archive at `/projects`.
- **Certificates** — a two-pane viewer: a name-only list on the left
  (auto-sorted newest first) and the selected certificate's image/details on
  the right. The list becomes a horizontal scrolling menu on mobile.
- **Contact** — heading/description on the left, action buttons
  (Email/LinkedIn/GitHub) right-aligned.

Which of the middle sections (Experience/Skills/Achievements/Projects/
Certificates) are shown, and in what order, is controlled from
**Admin → Sections** — the same list drives both the page and the nav menu.

## Admin CMS (`/admin`)

Auth-gated pages for every content type: Profile (sidebar + about),
Experience, Skills, Projects, Achievements, Certifications, Contact/Settings,
SEO, Sections (reorder/show/hide), and a Media Library for image uploads to
Supabase Storage. Rich-text fields support bold/italic/underline.

## Architecture

- `src/components/sections/*` — one component per public section.
- `src/components/layout/*` — `Sidebar`, `Nav`.
- `src/lib/queries.ts` — fetches all content from Supabase with the seed
  (`src/lib/content.ts`) as a typed fallback, so the site never renders
  empty.
- `src/lib/types.ts` — the shared content model (`Profile`, `Experience`,
  `Skill`, `Project`, `Certification`, `Settings`, …).
- `src/admin/*` — the auth-gated CMS; CRUD pages share `DataTable` +
  `FormDrawer`.
- `src/context/AuthContext.tsx` — Supabase Auth session, sign-in, and
  password-reset flow.

## Security model

The public site uses the **anon key** and can only *read* (enforced by RLS).
All writes require an authenticated session whose `profiles.role = 'admin'`,
checked both by the route guard (UX) and RLS policies (real enforcement).

## Deploy (Vercel)

1. Import this repo at [vercel.com/new](https://vercel.com/new) — it
   auto-detects Vite (`tsc -b && vite build`, output `dist/`).
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment
   variables in the Vercel project settings.
3. `vercel.json` already rewrites all routes to `index.html`, so client-side
   routes (`/admin`, `/projects`) work on refresh.
4. Add your deployed domain to Supabase → **Authentication → URL
   Configuration** so admin login and password-reset links work in
   production.
