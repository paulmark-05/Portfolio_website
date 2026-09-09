import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
  ["/admin", "Dashboard", true], ["/admin/sections", "Page sections"], ["/admin/profile", "Profile"],
  ["/admin/projects", "Projects"], ["/admin/experience", "Experience"],
  ["/admin/achievements", "Achievements"],
  ["/admin/skills", "Skills"], ["/admin/certifications", "Certificates"],
  ["/admin/contact", "Contact"], ["/admin/seo", "SEO"], ["/admin/media", "Media Library"],
] as const;

export default function AdminLayout() {
  const { session, signOut } = useAuth();
  const nav = useNavigate();
  return (
    <div className="admin-shell">
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
      <main className="admin-main"><Outlet /></main>
    </div>
  );
}
