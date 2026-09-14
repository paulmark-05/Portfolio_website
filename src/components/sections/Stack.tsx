import { useRef, useState } from "react";
import { resolveTech, techLogoUrl } from "../../lib/techRegistry";
import { mediaUrl } from "../../lib/queries";
import { useDragMarquee } from "../../hooks/useDragMarquee";
import SectionTag from "../ui/SectionTag";
import type { Skill } from "../../lib/types";

function Bubble({ s, selected, onToggle }: { s: Skill; selected: boolean; onToggle: () => void }) {
  const tech = resolveTech(s.fullName || s.name);
  const logo = s.logo ? mediaUrl(s.logo) : techLogoUrl(tech);
  return (
    <div className={`bubble${selected ? " selected" : ""}`} title={s.fullName || s.name} onClick={onToggle}>
      {logo
        ? <img src={logo} alt={s.fullName || s.name} width={26} height={26} loading="lazy"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
        : <span style={{ color: s.color, fontWeight: 700, fontSize: 11 }}>{s.name.slice(0, 5)}</span>}
      <span className="label">{s.fullName || s.name}</span>
    </div>
  );
}

/** Skills — a single tech-logo marquee that auto-scrolls, and can also be
 *  dragged (mouse) or swiped (touch) to scroll through manually. Tapping a
 *  bubble pauses the auto-scroll and pins its name visible — the reliable
 *  way to see a label on touch, where there's no hover to trigger it. */
export default function Stack({ skills }: { skills: Skill[] }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  useDragMarquee(rowRef, 0.4, !!selected);

  const toggle = (id: string) => setSelected((cur) => (cur === id ? null : id));

  return (
    <div className="wrap">
      <section id="stack">
        <div className="sec-head reveal">
          <SectionTag>Skills</SectionTag>
        </div>
        <div className="tech-marquee reveal">
          <div className="tech-marquee-row" ref={rowRef}>
            <div className="tech-marquee-track">
              {skills.map((s) => <Bubble s={s} key={s.id} selected={selected === s.id} onToggle={() => toggle(s.id)} />)}
              {skills.map((s) => <Bubble s={s} key={`${s.id}-dup`} selected={selected === s.id} onToggle={() => toggle(s.id)} />)}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
