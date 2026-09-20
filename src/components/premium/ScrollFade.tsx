import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const FADE_PX = 280;

/** Wraps a top-level section so only the one currently in view reads at
 *  full opacity — everything else stays faded, like a spotlight moving
 *  down the page — instead of every section sitting at opacity 1 all the
 *  time. Unlike Reveal (which only fires once), this stays tied to scroll
 *  position for as long as the page is open.
 *
 *  The fade-in/out zone is a fixed pixel size (not a fraction of the
 *  section's own scroll-through range): a percentage-based fade would
 *  fade a very tall section out while it's still mostly in view, and take
 *  forever to fade a very tall section in. Converting that pixel size to
 *  the fraction useTransform needs means measuring the section's real
 *  height first. */
export default function ScrollFade({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [fadeFrac, setFadeFrac] = useState(0.18);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, fadeFrac, 1 - fadeFrac, 1], [0.08, 1, 1, 0.08]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const span = el.offsetHeight + window.innerHeight;
      setFadeFrac(Math.min(0.45, FADE_PX / Math.max(span, 1)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, []);

  return <motion.div ref={ref} style={{ opacity }}>{children}</motion.div>;
}
