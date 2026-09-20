/** @type {import('tailwindcss').Config} */

// Each semantic color resolves through a CSS variable (an "R G B" triplet)
// so a single `data-theme` swap on #premium-root re-themes every utility
// class already using it — no per-component light/dark variants needed —
// while still supporting Tailwind's opacity modifiers (`bg-void/70`, etc.).
function themedColor(varName) {
  return ({ opacityValue }) =>
    opacityValue === undefined ? `rgb(var(${varName}))` : `rgb(var(${varName}) / ${opacityValue})`;
}

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  // Tailwind is scoped to the new premium public site only — the existing
  // globals.css / admin.css reset already covers the admin CMS, and turning
  // preflight on would re-style native inputs/buttons there too.
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        void: themedColor("--pr-bg"),
        surface: themedColor("--pr-surface"),
        bone: themedColor("--pr-fg"),
        silver: themedColor("--pr-fg-muted"),
        mist: themedColor("--pr-fg-dim"),
        edge: themedColor("--pr-edge"),
        accent: themedColor("--pr-accent"),
      },
      fontFamily: {
        display: ["'Fraunces'", "Georgia", "serif"],
        sans: ["'Inter'", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
    },
  },
  plugins: [],
};
