import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSmoothScroll, scrollToHash } from "../../lib/smoothScroll";
import { SECTION_LABELS } from "../../lib/sections";
import { SECTION_ICONS, icGithub, icLinkedin, icMail, icFile } from "./navIcons";
import type { Profile, Settings } from "../../lib/types";

function RoleCycle({ roles }: { roles: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (roles.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % roles.length), 2800);
    return () => clearInterval(t);
  }, [roles]);
  if (!roles.length) return null;
  return (
    <div className="h-6 overflow-hidden font-mono text-xs tracking-wide text-mist">
      <motion.div key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
        {roles[i]}
      </motion.div>
    </div>
  );
}

function IconLink({ href, label, icon, mail = false }: { href: string; label: string; icon: JSX.Element; mail?: boolean }) {
  return (
    <a
      href={href}
      target={mail ? undefined : "_blank"}
      rel={mail ? undefined : "noopener"}
      aria-label={label}
      className="pr-btn-hover group/icon relative flex h-9 w-9 items-center justify-center rounded-full border border-edge/12 bg-surface/25 text-mist backdrop-blur-md transition-colors hover:text-bone"
    >
      <span className="h-[15px] w-[15px]">{icon}</span>
      <span className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-edge/15 bg-surface/85 px-2.5 py-1 font-mono text-[11px] text-bone opacity-0 backdrop-blur-xl transition-opacity duration-150 group-hover/icon:opacity-100">
        {label}
      </span>
    </a>
  );
}

export default function PremiumSideNav({ profile, settings }: { profile: Profile; settings: Settings }) {
  const { lenisRef } = useSmoothScroll();
  const [active, setActive] = useState("about");
  const [open, setOpen] = useState(false);
  const roles = (profile.roles || []).filter(Boolean);

  const links: [string, string][] = [
    ["about", "About"],
    ...settings.sections.filter((s) => s.visible).map(({ key }): [string, string] => [key, SECTION_LABELS[key]]),
    ["contact", "Contact"],
  ];

  const iconLinks = [
    settings.github && { href: settings.github, label: "GitHub", icon: icGithub },
    settings.linkedin && { href: settings.linkedin, label: "LinkedIn", icon: icLinkedin },
    settings.email && { href: `mailto:${settings.email}`, label: "Email", icon: icMail, mail: true },
    profile.resumeUrl && { href: profile.resumeUrl, label: "Résumé", icon: icFile },
  ].filter((x): x is { href: string; label: string; icon: JSX.Element; mail?: boolean } => !!x);

  useEffect(() => {
    const ids = links.map(([id]) => id);
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
  }, [settings.sections]);

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
      {/* Desktop — a top-anchored sidebar: availability badge, name,
          tagline and rotating role live here permanently (there's no
          separate "Main"/hero section on the page), then quick links to
          GitHub/LinkedIn/email/résumé, then the section menu below. */}
      <nav aria-label="Primary" className="fixed inset-y-0 left-0 z-50 hidden w-[280px] flex-col overflow-y-auto px-9 py-14 lg:flex xl:w-[320px] xl:px-11">
        <div>
          {profile.availabilityBadge && (
            <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-edge/15 bg-surface/25 px-3.5 py-1.5 text-[11px] text-silver backdrop-blur-md">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              {profile.availabilityBadge}
            </span>
          )}
          <h1 className="font-display text-3xl font-light leading-[1.05] text-bone xl:text-[2.25rem]">{profile.name}</h1>
          {profile.title && <p className="mt-2 font-display text-base font-light text-silver">{profile.title}</p>}
          <div className="mt-3"><RoleCycle roles={roles} /></div>

          {iconLinks.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {iconLinks.map((l) => <IconLink key={l.label} {...l} />)}
            </div>
          )}
        </div>

        <span className="my-9 h-px w-10 bg-edge/15" />

        <div className="flex flex-col items-start gap-6">
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
        </div>
      </nav>

      {/* Mobile / tablet — a compact top bar with the same links in a
          full-screen drawer. */}
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-4 lg:hidden">
        <a href="#about" onClick={go("about")} className="rounded-full border border-edge/12 bg-surface/30 px-3.5 py-1.5 font-mono text-sm tracking-tight text-bone backdrop-blur-xl">
          {profile.name.split(" ")[0]?.toLowerCase()}<span className="text-mist">.{profile.name.split(" ").slice(1).join("").toLowerCase() || "dev"}</span>
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
              {iconLinks.length > 0 && (
                <div className="mt-4 flex items-center gap-3">
                  {iconLinks.map((l) => (
                    <a
                      key={l.label}
                      href={l.href}
                      target={l.mail ? undefined : "_blank"}
                      rel={l.mail ? undefined : "noopener"}
                      aria-label={l.label}
                      onClick={() => setOpen(false)}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-edge/20 bg-surface/30 text-bone backdrop-blur-xl"
                    >
                      <span className="h-4 w-4">{l.icon}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
