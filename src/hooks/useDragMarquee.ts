import { useEffect, type RefObject } from "react";

/** Auto-scrolling marquee that's also drag-scrollable with the mouse —
 *  touch/trackpad get native horizontal scrolling for free via the
 *  element's own `overflow-x:auto`. Expects the track content to be
 *  duplicated once by the caller so the scroll position can jump back by
 *  exactly half the scrollWidth near either edge for a seamless loop. */
export function useDragMarquee(ref: RefObject<HTMLElement | null>, speed = 0.4) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let hovering = false;
    let dragging = false;
    let startX = 0;
    let startScroll = 0;

    const recenter = () => {
      const half = el.scrollWidth / 2;
      const max = el.scrollWidth - el.clientWidth;
      if (half <= 0 || max <= 0) return;
      if (el.scrollLeft <= 2) el.scrollLeft += half;
      else if (el.scrollLeft >= max - 2) el.scrollLeft -= half;
    };

    // start a little into the first copy so there's slack to drag either way immediately
    el.scrollLeft = el.scrollWidth / 4 || 0;

    const tick = () => {
      if (!hovering && !dragging && !reduceMotion) {
        el.scrollLeft += speed;
        recenter();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onPointerEnter = () => { hovering = true; };
    const onPointerLeave = (e: PointerEvent) => { hovering = false; endDrag(e); };
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return; // let touch/pen scroll natively
      dragging = true;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      el.classList.add("dragging");
      el.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      el.scrollLeft = startScroll - (e.clientX - startX);
      recenter();
    };
    function endDrag(e: PointerEvent) {
      if (!dragging) return;
      dragging = false;
      el!.classList.remove("dragging");
      try { el!.releasePointerCapture(e.pointerId); } catch { /* already released */ }
    }

    el.addEventListener("pointerenter", onPointerEnter);
    el.addEventListener("pointerleave", onPointerLeave);
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", onPointerEnter);
      el.removeEventListener("pointerleave", onPointerLeave);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endDrag);
      el.removeEventListener("pointercancel", endDrag);
    };
  }, [ref, speed]);
}
