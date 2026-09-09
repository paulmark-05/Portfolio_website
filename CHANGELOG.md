# CHANGELOG

All 12 fixes implemented directly in the codebase. Build verified:
`tsc --noEmit` clean, `vite build` succeeds (171 modules).

Format per entry: **file(s) modified · reason · feature implemented**

---

## FIX 1 — Contact whitespace before footer
- **`src/styles/globals.css`** · `#contact` used the generic `section{padding:120px 0}` and `footer` had `margin-top:60px`, leaving a large blank band above the footer · Scoped `#contact{padding:96px 0 72px}`, `.contact-char` height made fluid (`clamp(360px,42vw,440px)`), and `footer{padding:28px 0;margin-top:0}`. Footer now sits directly after contact content — no blank area.

## FIX 2 — Sticky navbar + section highlighting
- **`src/components/layout/Nav.tsx`** · The class template literal produced `site-navscrolled` (missing space), so the `nav.site-nav` fixed-position styling never matched · Fixed to `` `site-nav${scrolled ? " scrolled" : ""}` ``. Navbar is now fixed/visible throughout scroll; existing `useScrollSpy` active-state and `scroll-behavior:smooth` are preserved.
- **`src/styles/globals.css`** · Anchor targets hid under the fixed bar · Added `scroll-padding-top:84px` to `html`.

## FIX 3 — Hero + About shared character continuity
- **`src/components/sections/Hero.tsx`** (already wired) · Hero uses `heroImage || aboutImage` so the same character appears in both sections · same image source, same `.photo-panel` styling and float animation.
- **`src/components/sections/About.tsx`** · Hard cut between sections · Added `reveal` to the about character so it fades in smoothly (`.reveal` opacity/translate transition) — only the text changes, image stays constant and fades naturally.

## FIX 4 — Experience section visible heading
- **`src/components/sections/Experience.tsx`** · Section had no title (cards floated headingless) · Added `.exp-head` ("02 / experience — Where I've shipped") inside the pinned stage.
- **`src/styles/globals.css`** · `.exp-stage` was a 2-col grid with no room for a heading · Converted to a centered flex column (`.exp-head` on top, `.exp-rail-col` below as `flex:1`); updated `.exp-stage.no-char` and rail-col rules to match. Title is visible immediately.

## FIX 5 — Tech Stack: floating bubbles, no box, no clipping
- **`src/styles/globals.css`** · `.stack-scene` had a border, border-radius, gradient background and `overflow:hidden` (visible container + clipped bubbles) · Removed all container chrome (`background:transparent;border:0;overflow:visible`), centered the character (`.stack-char-wrap` → `align-items:center`), reduced height to `clamp(420px,52vh,520px)`, and tightened `#stack` padding so the section fits one desktop viewport. No border, no clipped bubbles.
- **`src/hooks/useTechBubbles.ts`** · Bubbles sat on a one-sided arc · Re-placed them on a full ring around the centered character; bubbles now render official tech logos via the registry (fallback to colored label).
- **`src/components/sections/Stack.tsx`** · Copy referenced a "workstation" box that no longer exists · Updated hint to "Hover any floating bubble…".

## FIX 6 — Awards section top spacing
- **`src/styles/globals.css`** · Generic section padding + 56px head margin pushed cards far below the title · Scoped `#certs{padding:72px 0 80px}`, `#certs .sec-head{margin-bottom:24px}`, `.certs-carousel{padding:0}`. Title and cards are visible together on desktop.

## FIX 7 — Admin CMS sidebar sticky
- **`src/styles/admin.css`** · The sticky sidebar was a grid item with no `align-self`, so the grid stretched it to full content height and sticky had no room to act (it scrolled away) · Added `align-self:start` alongside `position:sticky;top:0;height:100vh`. Sidebar now stays visible while forms scroll.

## FIX 8 — Skills CMS redesign (technology registry)
- **`src/lib/techRegistry.ts`** (new) · Central source of truth: name, short label, brand color, Simple Icons logo slug, search aliases; `resolveTech`, `techLogoUrl`, `searchTechs` helpers.
- **`src/admin/components/TechAutocomplete.tsx`** (new) · Reusable autocomplete (single + multi modes) with keyboard nav and logo previews.
- **`src/admin/pages/Skills.tsx`** · Removed the manual **category** and **accent color** fields · Typing a technology shows suggestions; selecting one auto-fills logo, brand color, full name and bubble label. No manual color selection.

## FIX 9 — Experience CMS redesign (date range)
- **`src/admin/components/MonthYearPicker.tsx`** (new) · Month + year selects emitting `YYYY-MM`, with `formatMonthYear`/`formatRange` helpers.
- **`src/admin/pages/Experience.tsx`** · Removed **Step Label**; added **Start date**, **End date**, **Currently Working** checkbox (+ optional location). The public `duration` label and `step_label` are auto-generated on save (date range built automatically; end becomes "Present" when current).

## FIX 10 — Project CMS redesign
- **`src/admin/pages/Projects.tsx`** · Removed **Slug** (auto-derived from title on save); added **Month-Year picker**, **Currently Active** checkbox (→ "— Present"), and **technology multi-select with autocomplete** (no manual typing of comma lists). `date_label` is auto-composed.

## FIX 11 — Project cards show official logos
- **`src/components/sections/Projects.tsx`** · Chips were plain text · Each chip now renders the official tech logo (Simple Icons CDN via the registry) with graceful fallback when a tech has no logo.
- **`src/styles/admin.css`** · Added `.proj .chip` flex + `.chip-logo` styling.

## FIX 12 — Live sync (no refresh)
- **`src/hooks/useRealtimeSync.ts`** (new) · The backend is Supabase, so the equivalent of a Socket.IO live channel is **Supabase Realtime** — a WebSocket subscription to Postgres changes on all six content tables that invalidates the cached content, triggering an automatic refetch · CMS edits appear on the portfolio instantly, no refresh.
- **`src/pages/Home.tsx`** · Calls `useRealtimeSync()`.
- **`src/lib/queries.ts`** · Derives `stepLabel` from the new `current` flag with seed fallback.

## Database migration
- **`supabase/migrations/0005_cms_redesign.sql`** (new) · Adds `experience.start_date/end_date/current/location` and `projects.date_value/current`; adds all content tables to the `supabase_realtime` publication (idempotent). Run once in the Supabase SQL editor. The site runs without it (seed/fallback), but the new CMS fields and live sync require it.

---

### Notes
- Logos are loaded from the Simple Icons CDN by slug, so no binary logo assets are bundled and any technology added to `techRegistry.ts` automatically gets a logo + color everywhere (skills bubbles, project chips, CMS).
- No frameworks added; architecture, design tokens, and all existing CRUD preserved.
