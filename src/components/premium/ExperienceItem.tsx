import { motion, useTransform, type MotionValue } from "framer-motion";
import { initialsOfOrg } from "../../lib/format";
import type { Experience as Exp, Project } from "../../lib/types";

/** One timeline row. Its own useTransform (rather than the parent calling
 *  useTransform once per item in a loop) keeps this safe under React's
 *  rules of hooks even if the experience list's length changes between
 *  renders (e.g. a live edit from /admin). Opacity is driven directly by
 *  scroll progress — no "once" — so it reverses cleanly on scroll-up. */
export default function ExperienceItem({
  e, start, ongoing, linkedProject, scrollYProgress, rangeStart, rangeEnd, headlineRef, onProjectClick,
}: {
  e: Exp;
  start: { label: string };
  ongoing: boolean;
  linkedProject: Project | null;
  scrollYProgress: MotionValue<number>;
  rangeStart: number;
  rangeEnd: number;
  headlineRef: (el: HTMLHeadingElement | null) => void;
  onProjectClick: (id: string) => (ev: React.MouseEvent) => void;
}) {
  const safeEnd = Math.max(rangeEnd, rangeStart + 0.001);
  const reveal = useTransform(scrollYProgress, [rangeStart, safeEnd], [0, 1]);
  const y = useTransform(reveal, [0, 1], [24, 0]);

  return (
    <motion.li
      style={{ opacity: reveal, y }}
      className="relative -mx-4 rounded-2xl px-4 py-10 transition-colors duration-300 hover:bg-surface/20 sm:-mx-6 sm:grid sm:grid-cols-[120px_1fr] sm:gap-10 sm:px-6"
    >
      <div className="mb-4 flex items-center gap-3 sm:mb-0 sm:block">
        <span className="font-mono text-xs tracking-widest text-mist">{start.label}</span>
        {ongoing && (
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-bone sm:mt-2 sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />Ongoing
          </span>
        )}
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-edge/12 bg-surface/40 font-mono text-[11px] text-silver backdrop-blur-md">
            {e.logo ? <img src={e.logo} alt="" className="h-full w-full object-cover" /> : initialsOfOrg(e.company)}
          </span>
          <div>
            <h3 ref={headlineRef} className="font-display text-xl text-bone sm:text-2xl">{e.role}</h3>
            <div className="text-sm text-mist">{e.company}</div>
          </div>
        </div>

        {e.stepLabel && <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-mist">{e.stepLabel}</div>}
        <p className="mt-4 max-w-2xl text-justify text-base leading-relaxed text-silver [&_b]:font-medium [&_b]:text-bone" dangerouslySetInnerHTML={{ __html: e.description }} />

        {linkedProject && (
          <a
            href={`#project-${linkedProject.id}`}
            onClick={onProjectClick(linkedProject.id)}
            className="pr-btn-hover mt-5 inline-flex items-center gap-2 rounded-full border border-edge/20 bg-surface/25 px-4 py-2 text-xs text-bone backdrop-blur-md hover:border-edge/40 hover:bg-surface/40"
          >
            View “{linkedProject.title}” ↗
          </a>
        )}
      </div>
    </motion.li>
  );
}
