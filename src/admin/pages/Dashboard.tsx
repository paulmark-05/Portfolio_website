import { Link } from "react-router-dom";
import { useContent } from "../../hooks/useContent";
import { useSpotlight } from "../../hooks/useSpotlight";

function StatCard({ label, count, to }: { label: string; count: number | string; to: string }) {
  const { ref, onMouseMove } = useSpotlight<HTMLAnchorElement>();
  return (
    <Link to={to} className="admin-stat spotlight" ref={ref} onMouseMove={onMouseMove}>
      <b>{count}</b><span>{label}</span>
    </Link>
  );
}

export default function Dashboard() {
  const { content } = useContent();
  const stats = [
    ["Projects", content.projects.length, "/admin/projects"],
    ["Experience", content.experience.length, "/admin/experience"],
    ["Achievements", content.achievements.length, "/admin/achievements"],
    ["Skills", content.skills.length, "/admin/skills"],
    ["Certifications", content.certifications.length, "/admin/certifications"],
    ["Media", "↗", "/admin/media"],
  ] as const;
  return (
    <div>
      <span className="admin-eyebrow">// welcome back</span>
      <h1 className="admin-h1">Dashboard</h1>
      <p style={{ color: "var(--muted)", marginBottom: 24 }}>Everything on the live site is editable here — no code edits needed.</p>
      <div className="admin-stats">
        {stats.map(([label, count, to]) => (
          <StatCard key={label} label={label} count={count} to={to} />
        ))}
      </div>
    </div>
  );
}
