import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
  ["/admin", "Dashboard", true], ["/admin/sections", "Page sections"], ["/admin/profile", "Profile"],
  ["/admin/projects", "Projects"], ["/admin/experience", "Experience"],
  ["/admin/achievements", "Achievements"],
  ["/admin/skills", "Skills"], ["/admin/certifications", "Certificates"],
  ["/admin/contact", "Contact"], ["/admin/seo", "SEO"], ["/admin/media", "Media Library"],
] as const;

const NAV_KEY = "admin_nav_open";

const icMenu = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></svg>
);

export default function AdminLayout() {
  const { session, signOut } = useAuth();
  const nav = useNavigate();
  // Defaults open on a normal desktop, closed on a narrow screen so the
  // nav doesn't eat the whole viewport on first load.
  const [open, setOpen] = useState(() => {
    try {
      const saved = localStorage.getItem(NAV_KEY);
      if (saved !== null) return saved === "1";
    } catch { /* ignore */ }
    return typeof window === "undefined" || window.innerWidth > 900;
  });

  useEffect(() => {
    try { localStorage.setItem(NAV_KEY, open ? "1" : "0"); } catch { /* ignore */ }
  }, [open]);

  return (
    <div className={`admin-shell${open ? "" : " nav-collapsed"}`}>
      <button
        className="admin-nav-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Hide navigation" : "Show navigation"}
        aria-expanded={open}
      >
        {icMenu}
      </button>
      <div className="admin-nav-scrim" onClick={() => setOpen(false)} aria-hidden="true" />
      <aside className="admin-sidebar">
        <a className="logo" href="/"><span className="dot" />nayani.paul</a>
        <span className="admin-nav-tag">// cms</span>
        <nav className="admin-nav">
          {NAV.map(([to, label, end], i) => (
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
