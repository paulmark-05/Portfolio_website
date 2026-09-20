import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode, type MutableRefObject } from "react";
import Lenis from "lenis";

interface SmoothScrollApi {
  lenisRef: MutableRefObject<Lenis | null>;
  /** Signed scroll velocity, updated every Lenis tick — read this from a
   *  rAF loop (e.g. the silk shader), never as a React dependency. */
  velocityRef: MutableRefObject<number>;
}

const SmoothScrollContext = createContext<SmoothScrollApi | null>(null);

/** Runs Lenis's own rAF loop for buttery scroll, and tracks live velocity
 *  in a ref so the WebGL background can react to it without re-rendering
 *  React on every scroll tick. */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const velocityRef = useRef(0);

  useEffect(() => {
    const lenis = new Lenis({
      // continuous lerp (rather than a fixed duration+easing per scroll
      // event) reads as one unbroken glide — the "luxury" smooth-scroll
      // feel — instead of a series of discrete, snapping animations.
      // Slightly softer than Lenis's own 0.1 default, paired with a gentle
      // wheel multiplier so each notch nudges rather than shoves.
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.1,
    });
    lenisRef.current = lenis;

    const onScroll = (e: { velocity: number }) => {
      velocityRef.current = e.velocity;
    };
    lenis.on("scroll", onScroll);

    let rafId = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const value = useMemo<SmoothScrollApi>(() => ({ lenisRef, velocityRef }), []);
  return <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>;
}

export function useSmoothScroll() {
  const ctx = useContext(SmoothScrollContext);
  if (!ctx) throw new Error("useSmoothScroll must be used within a SmoothScrollProvider");
  return ctx;
}

/** Smoothly scroll to an in-page anchor via Lenis, with a graceful fallback
 *  for the (unlikely) case the provider hasn't mounted yet. `offset`
 *  defaults to a little breathing room above the target; pass 0 to land
 *  the target's top flush with the viewport's top (e.g. sidebar nav,
 *  where a section should read as its own full-viewport "page"). */
export function scrollToHash(lenisRef: MutableRefObject<Lenis | null>, hash: string, offset = -84) {
  const el = document.querySelector(hash);
  if (!(el instanceof HTMLElement)) return;
  if (lenisRef.current) {
    lenisRef.current.scrollTo(el, {
      offset,
      duration: 1.6,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
  }
  else el.scrollIntoView({ behavior: "smooth" });
}
