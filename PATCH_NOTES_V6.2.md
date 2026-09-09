# PATCH NOTES — V6.2

Single-purpose fix: Awards / Certificates layout now fits inside one desktop
viewport. **Only `src/styles/globals.css` was changed** (the certs section + its
two responsive breakpoints). No component, CMS, schema, route, or other section
was touched. Build verified: `vite build` succeeds.

> Note on files: this project keeps all section styling in one `globals.css` —
> there is no separate `awards.css` / `Certificates.tsx`. The certs rules live in
> the `#certs` block of `globals.css`, so that block is the only thing edited.

---

## What was wrong
The preview used `aspect-ratio:1.6/1` with `max-height:380px`. At the card's
width (~760px) the aspect box computes to ~475px tall and `max-height` doesn't
clamp a width-driven aspect box — so the card ran ~675px+ and the section
overflowed the viewport, forcing the internal scroll seen in the screenshot.

## The fix (CSS only, `#certs` block)
- **Grid:** `28% / 72%`, `gap:48px`, `align-items:start`.
- **Card:** `max-width:760px`, **`max-height:620px`**, `display:flex; flex-direction:column`, `border-radius:24px`, `overflow:hidden`. It fills its 72% column (≈740px at the 1140px container) so there's no horizontal blank.
- **Preview (image area ≈60%):** replaced the aspect-ratio with a **fixed `height:360px`**, `object-fit:contain`, `24px` padding on a light neutral hatch + subtle divider — no oversized empty area, image never distorts.
- **Info area (≈40%):** `flex:1; min-height:0; overflow:auto` so it only scrolls internally if a description is extremely long. Title **24px**, meta `margin-bottom:10px`, description clamped to 3 lines, buttons row unchanged.
- **Section padding** trimmed to `48px` top/bottom (8px grid).
- **Result:** card ≈ **572px**, whole section ≈ **765px** — fits a 1440×820 screen with the fixed nav, no scrolling.

## Responsive
- **>1000px:** 28% / 72%, preview 360px.
- **≤1000px (tablet):** **35% / 65%**, preview 300px.
- **≤760px (mobile):** stacks (list scrolls horizontally above the card), preview 240px, card `max-height:none`.
- Removed leftover dead `.cert-card.*` carousel rules from the two breakpoints.

## Untouched (as required)
Selection logic, certificate switching, fade/slide animation, hover, View
credential + Download buttons, modal, CMS, schema, component API, routing, and
every other section.
