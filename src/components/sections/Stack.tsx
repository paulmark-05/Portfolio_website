import { useRef } from "react";
import { resolveTech, techLogoUrl } from "../../lib/techRegistry";
import { mediaUrl } from "../../lib/queries";
import { useDragMarquee } from "../../hooks/useDragMarquee";
import SectionTag from "../ui/SectionTag";
import type { Skill } from "../../lib/types";

function Bubble({ s }: { s: Skill }) {
  const tech = resolveTech(s.fullName || s.name);
  const logo = s.logo ? mediaUrl(s.logo) : techLogoUrl(tech);
  return (
    <div className="bubble" title={s.fullName || s.name}>
      {logo
        ? <img src={logo} alt={s.fullName || s.name} width={26} height={26} loading="lazy"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
        : <span style={{ color: s.color, fontWeight: 700, fontSize: 11 }}>{s.name.slice(0, 5)}</span>}
      <span className="label">{s.fullName || s.name}</span>
    </div>
  );
}

/** Skills — a single tech-logo marquee that auto-scrolls, and can also be
 *  dragged (mouse) or swiped (touch) to scroll through manually. */
export default function Stack({ skills }: { skills: Skill[] }) {
  const rowRef = useRef<HTMLDivElement>(null);
  useDragMarquee(rowRef);

  return (
    <div className="wrap">
      <section id="stack">
        <div className="sec-head reveal">
          <SectionTag>Skills</SectionTag>
        </div>
        <div className="tech-marquee reveal">
          <div className="tech-marquee-row" ref={rowRef}>
            <div className="tech-marquee-track">
              {skills.map((s) => <Bubble s={s} key={s.id} />)}
              {skills.map((s) => <Bubble s={s} key={`${s.id}-dup`} />)}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
