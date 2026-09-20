import { useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import SectionLabel from "./SectionLabel";
import ExperienceItem from "./ExperienceItem";
import { useSmoothScroll, scrollToHash } from "../../lib/smoothScroll";
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

const TRACK_PAD = 16;

export default function ExperienceSection({ experience, projects, index }: { experience: Exp[]; projects: Project[]; index: string }) {
  const { lenisRef } = useSmoothScroll();
  const navigate = useNavigate();
  const trackRef = useRef<HTMLDivElement>(null);
  const headlineRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const [trackHeight, setTrackHeight] = useState(0);
  const [markerY, setMarkerY] = useState<number[]>([]);

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start center", "end center"] });

  const lastMarkerY = markerY.length ? markerY[markerY.length - 1] : trackHeight;
  const lo = TRACK_PAD, hi = Math.max(trackHeight - TRACK_PAD, TRACK_PAD);

  // Raw (unclamped) position the glow would be at for this scroll progress.
  const rawY = useTransform(scrollYProgress, (p) => lo + p * (hi - lo));
  // Capped at the last headline — nothing travels or glows past it.
  const clampedY = useTransform(rawY, (y) => Math.min(Math.max(y, 0), lastMarkerY || hi));
  const trailHeight = clampedY;
  const tipOpacity = useTransform(rawY, (y) => {
    const fadeInEnd = lo + 30;
    const fadeOutStart = (lastMarkerY || hi) - 70;
    const fadeOutEnd = (lastMarkerY || hi) - 12;
    let op = 1;
    if (y < fadeInEnd) op = Math.max(0, (y - lo) / Math.max(fadeInEnd - lo, 1));
    if (y > fadeOutStart) op = Math.min(op, Math.max(0, 1 - (y - fadeOutStart) / Math.max(fadeOutEnd - fadeOutStart, 1)));
    return op;
  });

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => {
      setTrackHeight(el.offsetHeight);
      const trackTop = el.getBoundingClientRect().top;
      const ys = headlineRefs.current
        .filter((h): h is HTMLHeadingElement => !!h)
        .map((h) => h.getBoundingClientRect().top - trackTop + h.offsetHeight / 2);
      setMarkerY(ys);
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

  // Fractional scroll-progress equivalents of each measured headline
  // position, used to gate each item's own reveal — an item fades in as
  // the glow travels from the previous headline to its own.
  const markerFrac = markerY.map((y) => Math.min(Math.max((y - lo) / Math.max(hi - lo, 1), 0), 1));

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
          className="pointer-events-none absolute -left-2 bottom-0 top-0 block w-px bg-edge/12 sm:left-[140px]"
        />
        <motion.div
          aria-hidden="true"
          style={{ height: trailHeight }}
          className="pointer-events-none absolute -left-2 top-0 block w-[3px] -translate-x-1/2 overflow-hidden rounded-full sm:left-[140px]"
        >
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: "100%",
              background: "linear-gradient(to top, rgb(var(--pr-accent)) 0px, rgba(45,205,214,0.55) 40px, rgba(45,205,214,0) 170px)",
            }}
          />
        </motion.div>
        <motion.span
          aria-hidden="true"
          style={{ top: clampedY, opacity: tipOpacity }}
          className="pointer-events-none absolute -left-2 z-10 block h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_0_5px_rgb(var(--pr-accent)/0.25),0_0_22px_5px_rgb(var(--pr-accent)/0.65)] sm:left-[140px]"
        />

        <ol className="space-y-0">
          {items.map(({ e, start }, i) => (
            <ExperienceItem
              key={e.id}
              e={e}
              start={start}
              ongoing={/present/i.test(e.duration)}
              linkedProject={e.linkedProjectId ? projects.find((p) => p.id === e.linkedProjectId) ?? null : null}
              scrollYProgress={scrollYProgress}
              rangeStart={i === 0 ? 0 : markerFrac[i - 1] ?? 0}
              rangeEnd={markerFrac[i] ?? 1}
              headlineRef={(el) => { headlineRefs.current[i] = el; }}
              onProjectClick={goToProject}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}
