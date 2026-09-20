import { useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import SectionLabel from "./SectionLabel";
import { useSmoothScroll, scrollToHash } from "../../lib/smoothScroll";
import { initialsOfOrg } from "../../lib/format";
import type { Experience as Exp, Project } from "../../lib/types";

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

function startOf(duration: string): { label: string; key: number } {
  const m = (duration || "").match(/([A-Za-z]{3,9})\.?\s+(\d{4})/);
  if (!m) return { label: duration || "", key: 0 };
  const mon = MONTHS[m[1].slice(0, 3).toLowerCase()] ?? 0;
  return { label: `${m[1].slice(0, 3)} ${m[2]}`, key: Number(m[2]) * 12 + mon };
}

const GLOW_LOW = 0.25;

/** Builds the [scroll progress -> glow strength] keyframes: full glow
 *  exactly where the dot is centered on an entry's marker, dipping down
 *  while it travels the line between two markers. Guards against
 *  non-increasing input, which framer-motion's useTransform requires. */
function buildGlowCurve(markerProgress: number[]): { input: number[]; output: number[] } {
  const input: number[] = [];
  const output: number[] = [];
  const push = (x: number, y: number) => {
    const cx = Math.min(Math.max(x, 0), 1);
    const last = input[input.length - 1];
    if (last !== undefined && cx <= last + 0.001) return;
    input.push(cx);
    output.push(y);
  };
  if (markerProgress.length === 0) {
    return { input: [0, 1], output: [1, 1] };
  }
  push(0, markerProgress[0] <= 0.02 ? 1 : GLOW_LOW);
  markerProgress.forEach((p, i) => {
    push(p, 1);
    const next = markerProgress[i + 1];
    if (next !== undefined) push((p + next) / 2, GLOW_LOW);
  });
  push(1, markerProgress[markerProgress.length - 1] >= 0.98 ? 1 : GLOW_LOW);
  if (input.length < 2) { input.push(Math.min(input[0] + 1, 1)); output.push(output[0]); }
  return { input, output };
}

export default function ExperienceSection({ experience, projects, index }: { experience: Exp[]; projects: Project[]; index: string }) {
  const { lenisRef } = useSmoothScroll();
  const navigate = useNavigate();
  const trackRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [trackHeight, setTrackHeight] = useState(0);
  const [markerProgress, setMarkerProgress] = useState<number[]>([]);

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start center", "end center"] });
  const dotTop = useTransform(scrollYProgress, [0, 1], [16, Math.max(trackHeight - 16, 16)]);
  const dotOpacity = useTransform(scrollYProgress, [0, 0.03, 0.97, 1], [0, 1, 1, 0]);

  const { input: glowInput, output: glowOutput } = buildGlowCurve(markerProgress);
  const glow = useTransform(scrollYProgress, glowInput, glowOutput);
  const dotScale = useTransform(glow, [GLOW_LOW, 1], [0.7, 1.1]);
  const dotShadow = useTransform(glow, (g) =>
    `0 0 0 ${2 + 4 * g}px rgba(45,205,214,${(0.12 + 0.3 * g).toFixed(2)}), 0 0 ${6 + 18 * g}px ${2 + 4 * g}px rgba(45,205,214,${(0.25 + 0.4 * g).toFixed(2)})`
  );

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => {
      const h = el.offsetHeight;
      setTrackHeight(h);
      const trackTop = el.getBoundingClientRect().top;
      const lo = 16, hi = Math.max(h - 16, 16);
      const progresses = markerRefs.current
        .filter((m): m is HTMLSpanElement => !!m)
        .map((m) => {
          const y = m.getBoundingClientRect().top - trackTop + m.offsetHeight / 2;
          return Math.min(Math.max((y - lo) / Math.max(hi - lo, 1), 0), 1);
        });
      setMarkerProgress(progresses);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [experience.length]);

  if (!experience.length) return null;
  const items = [...experience]
    .map((e) => ({ e, start: startOf(e.duration) }))
    .sort((a, b) => b.start.key - a.start.key || a.e.sortOrder - b.e.sortOrder);

  const goToProject = (projectId: string) => (ev: React.MouseEvent) => {
    ev.preventDefault();
    const targetId = `project-${projectId}`;
    if (document.getElementById(targetId)) scrollToHash(lenisRef, `#${targetId}`);
    else { sessionStorage.setItem("portfolioScroll", String(window.scrollY)); navigate(`/projects#${targetId}`); }
  };

  return (
    <section id="work" className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-24">
      <SectionLabel index={index}>Experience</SectionLabel>

      <div className="relative" ref={trackRef}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-[140px] top-0 hidden w-px bg-gradient-to-b from-edge/0 via-edge/20 to-edge/0 sm:block"
        />
        <motion.span
          aria-hidden="true"
          style={{ top: dotTop, opacity: dotOpacity }}
          className="pointer-events-none absolute left-[140px] z-10 hidden -translate-x-1/2 -translate-y-1/2 sm:block"
        >
          <motion.span style={{ scale: dotScale, boxShadow: dotShadow }} className="block h-3 w-3 rounded-full bg-accent" />
        </motion.span>

        <ol className="space-y-0">
          {items.map(({ e, start }, i) => {
            const ongoing = /present/i.test(e.duration);
            const linkedProject = e.linkedProjectId ? projects.find((p) => p.id === e.linkedProjectId) : null;
            return (
              <motion.li
                key={e.id}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
                transition={{ duration: 0.8, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="relative -mx-4 rounded-2xl px-4 py-10 transition-colors duration-300 hover:bg-surface/20 sm:-mx-6 sm:grid sm:grid-cols-[120px_1fr] sm:gap-10 sm:px-6"
              >
                <span
                  ref={(el) => { markerRefs.current[i] = el; }}
                  aria-hidden="true"
                  className="absolute left-[158px] top-[54px] hidden h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-edge/40 bg-void sm:block"
                />

                <div className="mb-4 flex items-center gap-3 sm:mb-0 sm:block">
                  <span className="font-mono text-xs tracking-widest text-mist">{start.label}</span>
                  {ongoing && <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-bone sm:mt-2 sm:flex"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />Ongoing</span>}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-edge/12 bg-surface/40 font-mono text-[11px] text-silver backdrop-blur-md">
                      {e.logo ? <img src={e.logo} alt="" className="h-full w-full object-cover" /> : initialsOfOrg(e.company)}
                    </span>
                    <div>
                      <h3 className="font-display text-xl text-bone sm:text-2xl">{e.role}</h3>
                      <div className="text-sm text-mist">{e.company}</div>
                    </div>
                  </div>

                  {e.stepLabel && <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-mist">{e.stepLabel}</div>}
                  <p className="mt-4 max-w-2xl text-justify text-base leading-relaxed text-silver [&_b]:font-medium [&_b]:text-bone" dangerouslySetInnerHTML={{ __html: e.description }} />

                  {linkedProject && (
                    <a
                      href={`#project-${linkedProject.id}`}
                      onClick={goToProject(linkedProject.id)}
                      className="pr-btn-hover mt-5 inline-flex items-center gap-2 rounded-full border border-edge/20 bg-surface/25 px-4 py-2 text-xs text-bone backdrop-blur-md hover:border-edge/40 hover:bg-surface/40"
                    >
                      View “{linkedProject.title}” ↗
                    </a>
                  )}
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
