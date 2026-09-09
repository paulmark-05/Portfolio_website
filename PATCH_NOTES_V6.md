# PATCH NOTES — V6

Refinement pass. No redesign; typography, palette, animations, CMS architecture
and data models preserved. Build verified: `tsc --noEmit` clean, `vite build`
succeeds. Existing components refactored in place — no duplicates.

---

### 1. Certificates — compact desktop layout
- **Files:** `src/components/sections/Certs.tsx`, `src/styles/globals.css`
- Layout is now **30% list / 70% card**. The selected card is **capped at 760px** and centred; the preview uses a **1.6:1 aspect with a 380px max-height** so it no longer stretches to fill the section. Added a **Download** button beside **View credential**. Subtle fade-in on change; list items have a hover slide. The whole section fits one desktop viewport.

### 2. Hero alignment — fills 100vh, About no longer peeks
- **Files:** `src/styles/globals.css`
- The hero block is now `min-height:100vh` (with `box-sizing:border-box` and a 72px top pad for the fixed nav), so **nothing from About is visible** until you scroll past the hero. The About block starts below the fold.

### 3. Availability badge — single binding
- **Files:** `src/lib/queries.ts` (verified), `src/components/sections/PinnedStory.tsx` (verified)
- The hero badge reads from one field, `availabilityBadge` (DB `availability_badge`), used identically by the live hero and the CMS preview. No duplicated state, no hardcoded value in the component. **Note:** the live update only persists once migration `0007_availability_badge.sql` has been run — until then a save silently drops the column (resilient retry) and the live site keeps showing the seeded value, which is the behaviour seen in the screenshot.

### 4. CMS preview — real hero image
- **Files:** `src/admin/pages/Profile.tsx`
- The preview renders the actual `PinnedStory` with the **uploaded hero image** (single source). When no image is uploaded it shows the same code-card the live hero shows (i.e. it always matches the real portfolio rather than inventing a placeholder).

### 5. Profile preview — Save + Close
- **Files:** `src/admin/pages/Profile.tsx`, `src/styles/admin.css`
- The preview drawer header now has **Save** and **Close** top-right. Save persists the current Profile immediately; Close only dismisses the preview.

### 6. Contact CMS — phone removed
- **Files:** `src/lib/types.ts`, `src/lib/content.ts`, `src/lib/queries.ts`, `src/admin/pages/Contact.tsx`
- `phone` removed from the Settings type, seed, query mapping, admin form and save payload. (The DB column, if present, is simply ignored.) Email / LinkedIn / GitHub / location / image remain.

### 7. Hero image consistency — single field
- **Files:** `src/admin/pages/Profile.tsx`, `src/components/sections/PinnedStory.tsx`
- One **shared image** field (writes `hero_image`, mirrored to `about_image` for backward-compatible reads). Hero, About and the CMS preview all use `profile.heroImage`. No separate hero/about uploads.

### 8. UI polish
- **Files:** `src/styles/globals.css`
- Hero image vertically centred against the text; headline, CTA row, meta row and image aligned; whitespace reduced. Spacing kept on the existing 8px-based rhythm.

---

### Migrations
- For the availability badge (and `about_title`) to persist, run `0007_availability_badge.sql`. All other patches are pure frontend/CMS and need no DB change.

### Dead code
- The earlier-removed `Hero.tsx` / `About.tsx` / `useHeroMorph.ts` / `usePinnedExperience.ts` remain absent. Nothing references `phone` any more.
