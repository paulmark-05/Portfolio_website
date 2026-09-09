# PATCH NOTES — V3

Patch release. Only the five requested issues were touched; everything else
preserved. Build verified: `tsc --noEmit` clean, `vite build` succeeds.

---

### Issue 1 — CMS sidebar permanently visible
- **Files:** `src/styles/admin.css`
- **Result:** Switched the admin shell from a CSS-grid sticky sidebar to a **fixed sidebar** (`position:fixed; left:0; top:0; bottom:0; width:248px`) with the main content offset by `margin-left:248px` — the Notion/Linear pattern. The sidebar now never moves; forms scroll independently; navigation is always accessible. On ≤900px it falls back to a static top bar with `margin-left:0`.

### Issue 2 — Skills page simplified to KPI cards
- **Files:** `src/admin/pages/Skills.tsx`, `src/styles/admin.css`
- **Result:** Replaced the editable table with a **KPI-card grid (5 per row)**. Each card shows **logo + technology name only** — no accent color, short label, display label, or category. Each card has a **top-right ✕** that opens a **confirmation toast** ("Delete React? [Cancel] [Delete]") before removing. **Create** is a single **Technology** autocomplete field (no other inputs); there is **no edit page** — only Create and Delete.

### Issue 3 — Technology registry expanded + custom upload
- **Files:** `src/lib/techRegistry.ts`, `src/admin/components/TechAutocomplete.tsx` (existing `allowCustom`), `src/admin/pages/Skills.tsx`
- **Result:** Registry grown to include CrewAI, LlamaIndex, Pinecone, n8n, Hugging Face, OpenAI, Anthropic, Weaviate, Qdrant, FastAPI, Flask, Django, Redis, GraphQL, Kubernetes, AWS, Pandas, NumPy, scikit-learn, Jupyter, Three.js and more — each with **name, logo slug, color**. Logos resolve via the **Simple Icons CDN** by slug. When a typed technology isn't found, the autocomplete offers **"Add as a custom technology"** and the Skills create form reveals a **custom logo upload** (stored in `skills.logo`). The same registry feeds **Projects, Skills, and the tech bubbles** — one source of truth.

### Issue 4 — Hero + About share ONE pinned image
- **Files:** `src/components/sections/Hero.tsx` (now intro-only), `src/components/sections/PinnedStory.tsx` (new), `src/pages/Home.tsx`, `src/styles/globals.css`
- **Result:** Hero is now just the opening full-screen "Hi, I'm Nayani" moment. A new **`PinnedStory`** section holds the hero copy and the about copy in a **single scrolling left column**, with **one character image in a sticky right column** (`position:sticky; top:0; height:100vh`). As the text scrolls from hero → about, **the same image stays pinned** — never duplicated, reloaded, swapped, or moved (verified by screenshotting both scroll positions: the image is identical and in place). The old two-stage `useHeroMorph` scroll-jacking and the separate About image were removed. On phones the column stacks (image first, not sticky).

### Issue 5 — Image positioning / text width
- **Files:** `src/styles/globals.css`
- **Result:** The story grid is **`1fr 420px`** with the image **right-aligned** (`justify-content:flex-end`), giving the text the wide column. No heading clipping, no hidden paragraphs — all copy fits comfortably in one desktop viewport (verified).

---

### Migrations (unchanged from V2; run once in Supabase for full persistence)
- `supabase/migrations/0005_cms_redesign.sql`
- `supabase/migrations/0006_skill_logo.sql` — `skills.logo` column (used by Issue 3 custom logos)

All admin saves still degrade gracefully if a column is missing.

### Notes
- Logos load from the Simple Icons CDN by slug, so they need network access at render. A few niche techs without a Simple Icon show a 2-letter fallback unless you upload a custom logo.
- The pinned image uses native CSS `position:sticky` — no scroll library, no image duplication.
