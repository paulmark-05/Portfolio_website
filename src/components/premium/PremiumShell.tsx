import type { ReactNode } from "react";
import { SmoothScrollProvider, useSmoothScroll } from "../../lib/smoothScroll";
import SatinBackground from "./SatinBackground";

function ShellInner({ children }: { children: ReactNode }) {
  const { velocityRef } = useSmoothScroll();
  return (
    <div id="premium-root" className="antialiased">
      <div className="fixed inset-0 z-0">
        <SatinBackground velocityRef={velocityRef} />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(to bottom, var(--pr-overlay-top), transparent, var(--pr-overlay-bottom))" }}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/** Shared page shell for every premium (public-facing) route: fixed satin
 *  WebGL backdrop + Lenis smooth scroll, with real content stacked above
 *  it. Kept as one component so Home, the project archive, and 404 all
 *  look and feel like the same site. Dark-only — there's no light theme
 *  to switch to. */
export default function PremiumShell({ children }: { children: ReactNode }) {
  return (
    <SmoothScrollProvider>
      <ShellInner>{children}</ShellInner>
    </SmoothScrollProvider>
  );
}
