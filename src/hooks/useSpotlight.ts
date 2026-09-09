import { useRef, useCallback } from "react";

/** Cursor-tracked spotlight glow (react-bits style) — sets --sx/--sy on the
 *  element itself so a ::before radial-gradient can follow the pointer.
 *  Pure CSS-variable approach: no state, no re-renders. */
export function useSpotlight<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  const onMouseMove = useCallback((e: React.MouseEvent<T>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--sx", `${e.clientX - r.left}px`);
    el.style.setProperty("--sy", `${e.clientY - r.top}px`);
  }, []);

  return { ref, onMouseMove };
}
