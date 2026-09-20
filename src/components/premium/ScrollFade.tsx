import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/** Wraps a top-level section so it continuously fades out as it scrolls
 *  past the viewport and fades in as the next one arrives — a soft
 *  crossfade between sections instead of a hard cut. Unlike Reveal (which
 *  only fires once), this stays tied to scroll position the whole time. */
export default function ScrollFade({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.18, 0.82, 1], [0, 1, 1, 0]);
  return <motion.div ref={ref} style={{ opacity }}>{children}</motion.div>;
}
