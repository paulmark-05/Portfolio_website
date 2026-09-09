import { useEffect, useState } from "react";
import { useScrollSpy } from "../../hooks/useScrollSpy";
import { useTheme } from "../../hooks/useTheme";
import { SECTION_LABELS } from "../../lib/sections";
import type { SectionConfig } from "../../lib/types";

export default function Nav({ resumeUrl, sections }: { resumeUrl: string; sections: SectionConfig[] }) {
  const { active, scrolled } = useScrollSpy();
  const { toggle } = useTheme();
  const [open, setOpen] = useState(false);

  // About and Contact are structural (always shown); the middle links
  // follow the same order + visibility the admin set for the page itself.
  const links: [string, string][] = [
    ["about", "About"],
    ...sections.filter((s) => s.visible).map(({ key }): [string, string] => [key, SECTION_LABELS[key]]),
    ["contact", "Contact"],
  ];

  // lock background scroll while the mobile drawer is open, and close it on Escape
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

  return (
    <>
    <nav id="nav" className={`site-nav${scrolled ? " scrolled" : ""}${open ? " menu-open" : ""}`}>
      <div className="nav-in">
        <a className="logo" href="#top" onClick={() => setOpen(false)}><span className="dot" />nayani.paul</a>
        <div className="nav-links" id="navLinks">
          {links.map(([id, label]) => (
            <a key={id} href={`#${id}`} data-sec={id} className={active === id ? "active" : ""}>
              {label}
            </a>
          ))}
        </div>
        <div className="nav-right">
          <button className="toggle" id="themeToggle" aria-label="Toggle theme" onClick={toggle}>
            <svg className="ic-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
            <svg className="ic-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" /></svg>
          </button>
          <a className="nav-cta" href={resumeUrl || "#"} target={resumeUrl ? "_blank" : undefined} rel="noopener">Résumé</a>
          <button
            className="nav-burger"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="navMobilePanel"
            onClick={() => setOpen((o) => !o)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>

    {open && <button className="nav-scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}
    <div className={`nav-mobile-panel${open ? " open" : ""}`} id="navMobilePanel" aria-hidden={!open} inert={!open ? "" : undefined}>
        <div className="nav-mobile-head">
          <span className="nav-mobile-tag">// navigate</span>
          <button className="nav-mobile-close" aria-label="Close menu" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div className="nav-mobile-links">
          {links.map(([id, label], i) => (
            <a
              key={id}
              href={`#${id}`}
              data-sec={id}
              className={active === id ? "active" : ""}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: open ? `${60 + i * 35}ms` : "0ms" }}
            >
              <span className="nav-mobile-idx">{String(i + 1).padStart(2, "0")}</span>
              {label}
            </a>
          ))}
        </div>
        <div className="nav-mobile-foot">
          <a className="nav-cta" href={resumeUrl || "#"} target={resumeUrl ? "_blank" : undefined} rel="noopener" onClick={() => setOpen(false)}>Résumé →</a>
        </div>
    </div>
    </>
  );
}
