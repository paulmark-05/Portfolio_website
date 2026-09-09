import { Link } from "react-router-dom";
import type { Project } from "../../lib/types";
import ProjectRow from "../ui/ProjectRow";
import SectionTag from "../ui/SectionTag";

/** Selected work — homepage shows the TOP 3 (featured first, topped up), with
 *  live shipped/active counters and a link to the full archive. */
export default function Projects({ projects }: { projects: Project[] }) {
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  const shown = [...featured, ...rest].slice(0, 3);
  const hasMore = projects.length > shown.length;
  const shipped = projects.length;
  const activeCount = projects.filter((p) => p.active).length;

  return (
    <div className="wrap">
      <section id="projects">
        <div className="sec-head reveal">
          <SectionTag>Projects</SectionTag>
          <span className="proj-counter">{shipped} shipped<span className="cdot">•</span>{activeCount} active</span>
        </div>
        <div className="projects-rows" id="projlist">
          {shown.map((p) => <ProjectRow key={p.id} p={p} />)}
        </div>
        {hasMore && (
          <div className="projects-archive-cta reveal">
            <Link className="btn btn-ghost" to="/projects" onClick={() => sessionStorage.setItem("portfolioScroll", String(window.scrollY))}>
              View Project Archive →
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
