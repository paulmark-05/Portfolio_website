import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSmoothScroll, scrollToHash } from "../../lib/smoothScroll";
import { SECTION_LABELS } from "../../lib/sections";
import { SECTION_ICONS } from "./navIcons";
import type { SectionConfig } from "../../lib/types";

export default function PremiumSideNav({ name, resumeUrl, sections }: { name: string; resumeUrl: string; sections: SectionConfig[] }) {
  const { lenisRef } = useSmoothScroll();
  const [active, setActive] = useState("top");
  const [open, setOpen] = useState(false);

  const links: [string, string][] = [
    ["about", "About"],
    ...sections.filter((s) => s.visible).map(({ key }): [string, string] => [key, SECTION_LABELS[key]]),
    ["contact", "Contact"],
  ];

  useEffect(() => {
    const ids = ["top", ...links.map(([id]) => id)];
    function onScroll() {
      const mid = window.innerHeight * 0.4;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= mid) current = id;
      }
      setActive(current);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    // Offset 0 — the picked section's top lands flush with the viewport
    // top, so it reads as its own full-viewport "page" rather than
    // scrolling to wherever it happens to sit with some breathing room.
    scrollToHash(lenisRef, `#${id}`, 0);
  };

  return (
    <>
      {/* Desktop — a plain vertical stack of section labels running down
          the left margin; the section currently in view steps up in size
          and glows, everything else stays small and quiet. */}
      <nav aria-label="Section navigation" className="fixed left-0 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-start gap-6 pl-9 lg:flex xl:pl-11">
        {links.map(([id, label]) => {
          const isActive = active === id;
          return (
            <a
              key={id}
              href={`#${id}`}
              onClick={go(id)}
              aria-current={isActive ? "true" : undefined}
              className={`group relative font-mono uppercase tracking-[0.2em] transition-all duration-300 hover:-translate-y-0.5 ${
                isActive ? "text-base text-bone" : "text-xs text-mist hover:text-silver"
              }`}
              style={isActive ? { textShadow: "0 0 12px rgb(var(--pr-accent) / 0.85), 0 0 28px rgb(var(--pr-accent) / 0.55)" } : undefined}
            >
              <span
                className={`absolute -left-4 top-1/2 h-px -translate-y-1/2 bg-accent transition-all duration-300 ${
                  isActive ? "w-3 opacity-100" : "w-0 opacity-0 group-hover:w-2 group-hover:opacity-70"
                }`}
              />
              {label}
            </a>
          );
        })}

        {resumeUrl && (
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener"
            className="pr-text-glow mt-2 font-mono text-xs uppercase tracking-[0.2em] text-mist transition-all duration-300 hover:-translate-y-0.5 hover:text-bone"
          >
            Résumé
          </a>
        )}
      </nav>

      {/* Mobile / tablet — a compact top bar with the same links in a
          full-screen drawer. */}
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-4 lg:hidden">
        <a href="#top" onClick={go("top")} className="rounded-full border border-edge/12 bg-surface/30 px-3.5 py-1.5 font-mono text-sm tracking-tight text-bone backdrop-blur-xl">
          {name.split(" ")[0]?.toLowerCase()}<span className="text-mist">.{name.split(" ").slice(1).join("").toLowerCase() || "dev"}</span>
        </a>
        <div className="flex items-center gap-2">
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-full border border-edge/15 bg-surface/30 backdrop-blur-xl"
          >
            <motion.span animate={{ rotate: open ? 45 : 0, y: open ? 6 : 0 }} className="h-px w-4 bg-bone" />
            <motion.span animate={{ opacity: open ? 0 : 1 }} className="h-px w-4 bg-bone" />
            <motion.span animate={{ rotate: open ? -45 : 0, y: open ? -6 : 0 }} className="h-px w-4 bg-bone" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-void/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex h-full flex-col items-center justify-center gap-5">
              {links.map(([id, label], i) => (
                <motion.a
                  key={id}
                  href={`#${id}`}
                  onClick={go(id)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-3 font-display text-3xl ${active === id ? "text-bone" : "text-mist"}`}
                >
                  <span className="h-6 w-6">{SECTION_ICONS[id]}</span>
                  {label}
                </motion.a>
              ))}
              {resumeUrl && (
                <a href={resumeUrl} target="_blank" rel="noopener" onClick={() => setOpen(false)} className="mt-4 rounded-full border border-edge/20 bg-surface/30 px-6 py-2 text-sm text-bone backdrop-blur-xl">
                  Résumé
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
