# PATCH NOTES — V4

Patch release. Only the 11 requested items were touched; the Hero + About
shared pinned image behavior is preserved. Build verified: `tsc --noEmit`
clean, `vite build` succeeds.

---

### 1 — About: remove Quick Facts box
- **Files:** `src/components/sections/PinnedStory.tsx`, `src/styles/globals.css`
- The empty "// Quick Facts" card was removed. About text now flows straight into the commendation highlight, and the story blocks were tightened so About fits one desktop viewport. The pinned/sticky character image is unchanged.

### 2 — Profile CMS redesign
- **Files:** `src/admin/pages/Profile.tsx`, `src/styles/admin.css`
- The editor is now grouped into **Hero content** (availability badge, headline, description, CTA 1/2 text + URL, résumé URL), **About content** (about title, about paragraphs), and **Character image** (one shared upload used by both Hero and About) plus the tech-stack image. **Typewriter Roles removed** from the CMS.

### 3 — Live preview mode
- **Files:** `src/admin/pages/Profile.tsx`, `src/styles/admin.css`
- A **Preview** button opens a side drawer that renders the real `PinnedStory` (Hero + About) from the **current unsaved form values** — WordPress-Customizer style. Because it reuses the production component, preview matches the live render exactly. **Preview** and **Save** sit together in the toolbar.

### 4 — Hero badge is CMS-controlled
- **Files:** `src/lib/types.ts`, `src/lib/content.ts`, `src/lib/queries.ts`, `src/components/sections/PinnedStory.tsx`, `src/admin/pages/Profile.tsx`, `supabase/migrations/0007_availability_badge.sql`
- New **Availability badge** field (`availability_badge` column) drives the hero eyebrow ("Open to internships", etc.). Falls back to the seed value; saves degrade gracefully if the column is absent.

### 5 — Section spacing reduced
- **Files:** `src/styles/globals.css`
- Global `section` padding dropped **120px → 80px**; story blocks, contact and awards tightened. No giant empty zones; premium rhythm kept.

### 6 — Contact fits one viewport
- **Files:** `src/styles/globals.css`
- `#contact` top padding reduced and the `sec-head` margin zeroed so the heading flows straight into content; the grid is `1fr 360px` with the image bottom-aligned (`align-items:end`) to the footer, which follows immediately. No empty band above the content.

### 7 — Certificates: list + carousel
- **Files:** `src/components/sections/Certs.tsx`, `src/styles/globals.css`
- Two columns: a **selectable list of all certificates** on the left (small type, active item highlighted) and the **looped carousel** on the right (center card large, neighbours partially visible). Selecting a list item jumps the carousel; arrows update the list highlight. Wraps both ways; never empty.

### 8 — Experience: timeline + detail panel
- **Files:** `src/components/sections/Experience.tsx`, `src/styles/globals.css`
- Replaced the carousel with a **vertical timeline (newest first)** on the left and a **detail panel** on the right. The active item updates **on scroll** (nearest to viewport center) and on **click**; the detail panel shows role, company, duration, description and tech logos. Apple/Stripe/Linear-style chronology, not a carousel.

### 9 — Featured projects on the homepage
- **Files:** `src/components/sections/Projects.tsx`, `src/components/ui/ProjectRow.tsx` (new), `src/styles/globals.css`
- The homepage now shows **only the top 3 featured** projects (falls back to first 3 if none flagged), with a **"View Project Archive →"** button below. The row card was extracted into a reusable `ProjectRow` so the homepage and archive share one design.

### 10 — Project archive page
- **Files:** `src/pages/ProjectArchive.tsx` (new), `src/App.tsx`, `src/styles/globals.css`
- New **`/projects`** route lists every project using the same `ProjectRow`. A top-left **"← Back to Portfolio"** restores the previous scroll position (saved to `sessionStorage` on the way in), not the homepage top.

### 11 — CMS sidebar label
- **Files:** `src/admin/AdminLayout.tsx`
- "nayani.paul / cms" → **"nayani.paul"**. The sidebar remains fixed (from V3).

---

### Shared data models (single source of truth)
`Profile / Project / Experience / Certification` live in `src/lib/types.ts`; the
whole site, the archive page and the CMS preview all read from `useContent()` /
the same `Profile` shape. `ProjectRow` is the one project-card implementation
used by both homepage and archive — no duplicated layout logic.

### Migrations (run once in Supabase for full persistence)
- `0005_cms_redesign.sql`, `0006_skill_logo.sql` (previous releases)
- `0007_availability_badge.sql` — `availability_badge` + `about_title` columns

All admin saves degrade gracefully if a new column is missing.

### Dead code (safe to delete)
`src/hooks/usePinnedExperience.ts` and `src/components/sections/About.tsx` are
no longer imported (Experience was rewritten; About is now inside PinnedStory).
