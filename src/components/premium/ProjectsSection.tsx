import { Link } from "react-router-dom";
import SectionLabel from "./SectionLabel";
import { Reveal } from "./Reveal";
import PremiumProjectRow from "./PremiumProjectRow";
import type { Project } from "../../lib/types";

export default function ProjectsSection({ projects, index }: { projects: Project[]; index: string }) {
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  const shown = [...featured, ...rest].slice(0, 3);
  const hasMore = projects.length > shown.length;
  const activeCount = projects.filter((p) => p.active).length;

  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-24">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1"><SectionLabel index={index}>Projects</SectionLabel></div>
        <span className="mt-1 font-mono text-xs text-mist">{projects.length} shipped · {activeCount} active</span>
      </div>

      <div>
        {shown.map((p, i) => <PremiumProjectRow key={p.id} p={p} index={i} />)}
      </div>

      {hasMore && (
        <Reveal delay={0.1} className="mt-12">
          <Link
            to="/projects"
            onClick={() => sessionStorage.setItem("portfolioScroll", String(window.scrollY))}
            className="pr-btn-hover inline-flex items-center gap-2 rounded-full border border-edge/20 bg-surface/25 px-6 py-3 text-sm text-bone backdrop-blur-md hover:border-edge/40 hover:bg-surface/40"
          >
            View Project Archive →
          </Link>
        </Reveal>
      )}
    </section>
  );
}
