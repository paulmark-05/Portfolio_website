# PATCH NOTES — V7 (complete)

Refinement pass: section rename, certificates viewport fit, and a broad CMS
expansion with toasts, a loader overlay and button states. Existing design
language, animations and architecture preserved. Build verified: `tsc --noEmit`
clean, `vite build` succeeds. All homepage copy now flows through the shared
data layer (no hardcoded section text).

---

## 1. Section renamed → "Certificates"
- **Files:** `Certs.tsx`, `Nav.tsx`, `AdminLayout.tsx`, `Certifications.tsx`
- Public nav, eyebrow (`05 / certificates`), heading (*Certificates*), CMS sidebar label and admin page title all read **Certificates**. The `#certs` anchor and `certifications` table name are unchanged (no routing/DB break).

## 2. Certificates fit one desktop viewport
- **File:** `globals.css` (`#certs`)
- 30% / 70%, `gap:40px`, card `max-width:760px` / `max-height:560px`, fixed **320px** preview (≈60/40), compact body. Measured: card ≈532px, section ≈715px. Responsive 30/70 · 35/65 · stacked.

## 3. Hero info-cards (CMS)
- **Files:** `types.ts`, `content.ts`, `queries.ts`, `PinnedStory.tsx`, `Profile.tsx`
- New `infoCards` model (`icon`, `text`, `visible`) replaces the hardcoded KIIT/Kolkata/GPA row. Editor in Profile admin: emoji + text + Visible checkbox + reorder (↑/↓) + add/remove. Hidden cards disappear automatically.

## 4. About content (CMS)
- **Files:** `queries.ts`, `Profile.tsx`
- About title and paragraphs were already editable; the **highlight card** (commendation) is now a CMS field too. All render in the live preview.

## 5. Tech Stack content (CMS)
- **Files:** `types.ts`, `content.ts`, `queries.ts`, `Stack.tsx`, `Home.tsx`
- New `stackTitle`, `stackQuote`, `stackDescription` (on settings). The section consumes them; nothing hardcoded.

## 6. Contact content (CMS) + phone removed
- **Files:** `types.ts`, `content.ts`, `queries.ts`, `Contact.tsx` (section + admin)
- `contactEyebrow`, `contactHeading`, `contactDescription` are CMS-driven alongside email/LinkedIn/GitHub/image. Phone fully gone (confirmed).

## 7. Achievements (richer CMS)
- **Files:** `types.ts`, `content.ts`, `queries.ts`, `Achievements.tsx` (section + admin)
- Added `organization`, `year`, `link`, `visible` to the schema. Admin form covers all fields with highlight + visible toggles and ↑/↓ reorder; section renders org · year and an optional link. Hidden items are filtered out.

## 8. Live preview
- Profile/About preview already renders the real `PinnedStory` with the uploaded hero image (and now info-cards + commendation). Save + Close in the drawer.

## 9-11. Toasts, loader overlay, button states
- **Files:** `context/ToastContext.tsx` (new), `AdminApp.tsx`, `admin.css`, and every CRUD page (Profile, Contact, Achievements, Projects, Skills, Certifications)
- A `ToastProvider` exposes `toast()` and `run()`; `run()` shows a **blur loader overlay** with a dynamic message, then a **success/error toast** (auto-dismiss 3s, slide-in). Save buttons show **Saving…** and are disabled while busy. Examples: "Profile updated", "Certificate added", "Skill deleted", "Failed to save project".

## 12. Migration
- **File:** `supabase/migrations/0009_cms_full_content.sql`
- Adds `profiles.info_cards` (jsonb) + `profiles.commendation`; `settings.contact_eyebrow/heading/description` + `stack_title/quote/description`; `achievements.organization/year/link/visible`. Idempotent. **Run once in Supabase** for the new fields to persist — every save degrades gracefully (retries without missing columns) until then.

---

### Notes
- All new content has seed defaults, so the site renders identically before the migration is applied; only persistence of edits needs the columns.
- Verified offline (CSS render): certificates fit one viewport, hero info-cards render with emoji, toast + loader UI. A live click-through against Supabase is still worth doing for the save round-trips.
