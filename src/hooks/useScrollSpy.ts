import { useEffect, useState } from "react";

const SECTION_IDS = ["about", "work", "achievements", "stack", "projects", "certs", "contact"];

/** Active-section highlighting + nav blur-on-scroll, matching the original. */
export function useScrollSpy() {
  const [active, setActive] = useState<string>("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      const mid = window.innerHeight * 0.4;
      let current = "";
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) { current = id; break; }
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return { active, scrolled };
}
