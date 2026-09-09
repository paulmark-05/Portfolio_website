import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useContent } from "../hooks/useContent";
import { useReveal } from "../hooks/useReveal";
import ProjectRow from "../components/ui/ProjectRow";

/** Full project archive at /projects. Reuses the same ProjectRow card as the
 *  homepage (single source of truth). "Back" restores the previous scroll. */
export default function ProjectArchive() {
  const { content } = useContent();
  const navigate = useNavigate();
  useReveal([content.projects.length]);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const goBack = () => {
    const y = Number(sessionStorage.getItem("portfolioScroll") || "0");
    navigate("/");
    // restore the prior scroll position after the home route paints
    requestAnimationFrame(() => setTimeout(() => window.scrollTo(0, y), 60));
  };

  const all = [...content.projects].sort((a, b) => Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder);

  return (
    <div className="wrap">
      <section id="archive" className="archive">
        <button className="archive-back" onClick={goBack}>← Back to Portfolio</button>
        <div className="sec-head reveal" style={{ marginTop: 18 }}>
          <span className="sec-num">archive</span>
          <h2 className="sec-title">Project <em>archive</em></h2>
          <div className="sec-line" />
        </div>
        <p className="archive-sub">All projects — {all.length} total.</p>
        <div className="projects-rows">
          {all.map((p) => <ProjectRow key={p.id} p={p} />)}
        </div>
      </section>
    </div>
  );
}
