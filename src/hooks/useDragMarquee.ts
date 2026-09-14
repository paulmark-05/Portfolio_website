import { useEffect, useRef, type RefObject } from "react";

/** Auto-scrolling marquee that's also drag-scrollable with the mouse —
 *  touch/trackpad get native horizontal scrolling for free via the
 *  element's own `overflow-x:auto`. Expects the track content to be
 *  duplicated once by the caller so the scroll position can jump back by
 *  exactly half the scrollWidth near either edge for a seamless loop.
 *
 *  Auto-scroll is driven by a float accumulator kept outside `scrollLeft`,
 *  not by repeatedly reading-and-incrementing the DOM property itself —
 *  `scrollLeft` rounds to the nearest integer on every get/set, so a
 *  sub-1px `speed` (needed to not look janky) would never move it at all:
 *  each frame re-reads the same rounded value and re-adds the same
 *  fraction, which just rounds back down forever.
 *
 *  `paused` is a caller-controlled pause (e.g. a bubble tapped to show its
 *  name) — read through a ref so toggling it doesn't tear down and restart
 *  the scroll loop or the pointer listeners. */
export function useDragMarquee(ref: RefObject<HTMLElement | null>, speed = 0.4, paused = false) {
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let dragging = false;
    let startX = 0;
    let startScroll = 0;
    // start a little into the first copy so there's slack to drag either way immediately
    let pos = el.scrollWidth / 4 || 0;
    el.scrollLeft = pos;

    const recenter = () => {
      const half = el.scrollWidth / 2;
      const max = el.scrollWidth - el.clientWidth;
      if (half <= 0 || max <= 0) return;
      if (pos <= 2) pos += half;
      else if (pos >= max - 2) pos -= half;
    };

    const tick = () => {
      if (!dragging && !reduceMotion && !pausedRef.current) {
        // pick up any native touch/trackpad scroll that happened since the
        // last frame, so resuming auto-scroll after a swipe doesn't snap
        // back to a stale accumulator position
        if (Math.abs(el.scrollLeft - pos) > 2) pos = el.scrollLeft;
        pos += speed;
        recenter();
        el.scrollLeft = pos;
      } else {
        pos = el.scrollLeft;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

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
      const half = el.scrollWidth / 2;
      const max = el.scrollWidth - el.clientWidth;
      if (half > 0 && max > 0) {
        if (el.scrollLeft <= 2) el.scrollLeft += half;
        else if (el.scrollLeft >= max - 2) el.scrollLeft -= half;
      }
    };
    function endDrag(e: PointerEvent) {
      if (!dragging) return;
      dragging = false;
      pos = el!.scrollLeft;
      el!.classList.remove("dragging");
      try { el!.releasePointerCapture(e.pointerId); } catch { /* already released */ }
    }

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endDrag);
      el.removeEventListener("pointercancel", endDrag);
    };
  }, [ref, speed]);
}
