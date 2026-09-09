# Nayani Paul — Portfolio (React + Vite + TypeScript + Supabase CMS)

Production migration of the original single-file HTML portfolio. The public
site preserves the original design, layout, animations, and section order; the
sprite-character engine is retired in favour of three optimized photos (About,
Tech Stack, Contact — all on the right) plus a self-managed **Supabase CMS** at
`/admin`.

## Quick start

```bash
npm install
cp .env.example .env.local      # optional — site runs on seed data without it
npm run dev                     # http://localhost:5173   (CMS at /admin)
```

The site renders fully from built-in seed content **without** Supabase. Add env
vars + run the migrations to make everything editable from the CMS.

## Supabase setup

1. Create a project at supabase.com. Copy **Project URL** and **anon public key**
   into `.env.local` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
   Never add the `service_role` key — it is not used anywhere in the frontend.
2. In the SQL editor, run in order:
   `supabase/migrations/0001_init_schema.sql`,
   `0002_rls_policies.sql`, `0003_storage_buckets.sql`, then `supabase/seed.sql`.
3. Auth → Users → add your user. Then in SQL editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
4. Log in at `/admin/login`.

## Architecture

- `src/components/sections/*` — one component per section, emitting the original
  class names against the verbatim `src/styles/globals.css` (no redesign).
- `src/hooks/*` — the original scroll engine ported to React: `useHeroMorph`
  (two-stage hero), `usePinnedExperience` (pinned horizontal scroll),
  `useTechBubbles`, `useReveal`, `useScrollSpy`, `useTheme`.
- `src/lib/queries.ts` — fetches all content from Supabase with the seed as a
  typed fallback, so the site never renders empty.
- `src/admin/*` — auth-gated CMS (Dashboard, Profile, Projects, Experience,
  Skills, Certifications, Contact, SEO, Media Library). CRUD pages share
  `DataTable` + `FormDrawer`; images upload to Storage via `ImageUploader`.

## Security model

Public site uses the **anon key** and can only *read* (enforced by RLS).
All writes require an authenticated session whose `profiles.role = 'admin'`,
checked both by the route guard (UX) and RLS policies (real enforcement).

## Deploy (Vercel / Netlify)

- Build `npm run build` → output `dist/`.
- Set `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` in the host dashboard.
- SPA routing for `/admin/*` is handled by `vercel.json` (Vercel) or add a
  Netlify `_redirects`: `/*  /index.html  200`.

## What changed from the original (intentional)

- Sprite-character canvas engine **removed** (~690 KB of base64 dropped).
- About / Tech Stack / Contact use the three supplied photos on the right.
- Hero shows an on-brand code card on the right (set a `hero_image` in the CMS
  Profile page to use a photo instead).
- Experience section's character column removed; the rail spans full width.
- All content is database-driven and editable from `/admin`.

The original file is kept at `legacy/original-portfolio.html` for visual diffing.
