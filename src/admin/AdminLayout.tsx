import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useContent } from "../hooks/useContent";
import type { SectionKey } from "../lib/types";

type NavEntry = readonly [string, string] | readonly [string, string, boolean];

const HEAD: NavEntry[] = [
  ["/admin/sections", "Page sections", true],
  ["/admin/profile", "Profile"],
];
const TAIL: NavEntry[] = [
  ["/admin/contact", "Contact"],
  ["/admin/seo", "SEO"],
  ["/admin/media", "Media Library"],
];

// Every reorderable section from Page Sections maps to one admin nav
// entry — keyed the same way so the sidebar can follow whatever order
// gets set there instead of a second, independently-hardcoded order.
const SECTION_NAV: Record<SectionKey, NavEntry> = {
  highlights: ["/admin/highlights", "Highlights"],
  work: ["/admin/experience", "Experience"],
  stack: ["/admin/skills", "Skills"],
  achievements: ["/admin/achievements", "Achievements"],
  projects: ["/admin/projects", "Projects"],
  certs: ["/admin/certifications", "Certificates"],
};

/** Always-open sidebar — a permanent layout column, not a collapsible
 *  popover, so there's no burger toggle to lose track of. */
export default function AdminLayout() {
  const { session, signOut } = useAuth();
  const { content } = useContent();
  const nav = useNavigate();

  const orderedKeys = content.settings.sections.map((s) => s.key);
  // Any section key not yet in the fetched order (e.g. brand-new content
  // before a save) still gets a nav entry, appended in its default spot.
  const fallback = (Object.keys(SECTION_NAV) as SectionKey[]).filter((k) => !orderedKeys.includes(k));
  const middle = [...orderedKeys, ...fallback].map((k) => SECTION_NAV[k]);
  const navItems: NavEntry[] = [...HEAD, ...middle, ...TAIL];

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a className="logo" href="/"><span className="dot" />nayani.paul</a>
        <span className="admin-nav-tag">// cms</span>
        <nav className="admin-nav">
          {navItems.map(([to, label, end], i) => (
            <NavLink key={to} to={to} end={!!end} className={({ isActive }) => (isActive ? "active" : "")}>
              <span className="admin-nav-idx">{String(i).padStart(2, "0")}</span>{label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-user">
          <span>{session?.user.email}</span>
          <button className="btn btn-ghost" onClick={async () => { await signOut(); nav("/admin/login"); }}>Log out</button>
        </div>
      </aside>
      <main className="admin-main"><div className="admin-page"><Outlet /></div></main>
    </div>
  );
}
