# PATCH NOTES — V5

Patch release. Existing aesthetic, typography, colours, animations and CMS
architecture preserved. Build verified: `tsc --noEmit` clean, `vite build`
succeeds. All content flows through the shared `SiteContent` data layer
(`Profile`, `Experience`, `Achievement`, `Certificate`, `Project`) — CMS,
frontend, archive and preview consume the same source of truth.

---

### 1. Hero rework — intro removed
- **Files:** `src/pages/Home.tsx`; deleted `src/components/sections/Hero.tsx`, `src/hooks/useHeroMorph.ts`, `src/hooks/usePinnedExperience.ts`, `src/components/sections/About.tsx`; `src/styles/globals.css`
- The "Hi, I'm Nayani Paul / scroll" intro section is gone. The site now opens **directly** on the main hero ("Open to SWE internships… / Building software people actually use."). The hero block fills the first viewport minus the fixed nav. No scroll indicator. CMS Profile keeps only badge, headline, description, CTA 1/2, résumé URL (the typewriter field was already removed in V4).

### 2. Experience — sticky heading
- **Files:** `src/styles/globals.css`
- `02 / experience — Where I've shipped` is now `position:sticky` and stays visible while the timeline scrolls and the detail card updates, leaving only when the section leaves the viewport — same behaviour as Projects.

### 3. Certificates — carousel removed
- **Files:** `src/components/sections/Certs.tsx`, `src/styles/globals.css`
- Replaced the carousel (and its faded, clipped side cards) with a clean two-pane viewer: certificate **list** on the left, a **single selected card** on the right (preview image, title, issuer, year, credential link) that fades/slides in on change. No arrows, no overlapping cards. Click opens the full-image modal.

### 4 & 9. Achievements — CMS-driven
- **Files:** `src/components/sections/Achievements.tsx` (new), `src/admin/pages/Achievements.tsx` (new), `src/admin/AdminApp.tsx`, `src/admin/AdminLayout.tsx`, `src/lib/types.ts`, `src/lib/content.ts`, `src/lib/queries.ts`, `src/components/layout/Nav.tsx`, `src/styles/globals.css`, `supabase/migrations/0008_achievements_and_active.sql`
- New `Achievement` model (`title, description, icon?, category?, highlight?`). Frontend renders **premium minimal cards** (Linear/Stripe/Vercel feel): a highlighted lead card + a responsive grid. New **Achievements** admin page (between Experience and Skills in the sidebar) with add / edit / delete / **reorder** (↑/↓) and a **live preview card**. Added to the Dashboard KPIs and the public nav ("Wins").

### 5. Project metrics
- **Files:** `src/components/sections/Projects.tsx`, `src/admin/pages/Projects.tsx`, `src/lib/types.ts`, `src/lib/content.ts`, `src/lib/queries.ts`, `src/styles/globals.css`
- Live counter beside the heading: **"N shipped • M active"** (shipped = all projects, active = `active === true`). New **Currently Active** checkbox in the project form (`active: boolean`), saved resiliently (retries without the column if the migration isn't applied yet).

### 6. Project archive — Active badge
- **Files:** `src/components/ui/ProjectRow.tsx`, `src/styles/globals.css`
- Small, subtle **green-dot "Active"** badge on project cards (homepage and archive), shown only when `active === true`.

### 7. Global spacing reduction
- **Files:** `src/styles/globals.css`
- Base `section` padding 80px → **68px**; stack 64px; certs 60/64px; achievements 72px; experience 72px. Denser, intentional rhythm with no dead scroll zones.

### 8. Hero/About shared image
- **Files:** `src/styles/globals.css`
- The single pinned image is retained (one image, no swap/duplicate). It's offset for the fixed nav, kept vertically centered, and its float animation is disabled so the scroll transition is smooth rather than jumpy.

### 10. Implementation quality
- One data layer; no duplicated structures; achievements, project counters and active badges are all data-driven (nothing hardcoded in components).

---

### Migrations (run once in Supabase)
- `0008_achievements_and_active.sql` — adds `projects.active` and the `achievements` table (RLS + realtime). Plus prior `0005`–`0007`.
- All admin saves degrade gracefully if a column/table is missing.

### Notes
- Logos still load from the Simple Icons CDN (network required at render); custom logos can be uploaded in Skills.
- Removed dead files (`Hero.tsx`, `About.tsx`, `useHeroMorph.ts`, `usePinnedExperience.ts`) — the codebase no longer references them.
