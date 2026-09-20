import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import SectionLabel from "./SectionLabel";
import { Reveal } from "./Reveal";
import { useDragMarquee } from "../../hooks/useDragMarquee";
import { resolveTech, techLogoUrl } from "../../lib/techRegistry";
import { mediaUrl } from "../../lib/queries";
import type { Settings, Skill } from "../../lib/types";

function Bubble({ s, selected, onToggle }: { s: Skill; selected: boolean; onToggle: () => void }) {
  const tech = resolveTech(s.fullName || s.name);
  const logo = s.logo ? mediaUrl(s.logo) : techLogoUrl(tech);
  const ref = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const visible = hovering || selected;
  const label = s.fullName || s.name;

  // The bubble row scrolls horizontally with overflow-x clipping, which
  // also clips vertical overflow — a tooltip positioned relative to the
  // bubble would be cut off. Portal it to <body> at a fixed screen
  // position instead, so it always shows above everything.
  useLayoutEffect(() => {
    if (visible && ref.current) setRect(ref.current.getBoundingClientRect());
  }, [visible]);

  return (
    <div
      ref={ref}
      onClick={onToggle}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={`group relative mx-2 flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center rounded-2xl border bg-surface/30 backdrop-blur-xl transition-all duration-300 sm:h-20 sm:w-20 ${
        visible ? "border-edge/50 -translate-y-1" : "border-edge/10"
      }`}
      style={{ boxShadow: visible ? `0 0 0 1px ${s.color}55, 0 12px 28px -8px ${s.color}aa, 0 0 32px 4px ${s.color}55` : undefined }}
    >
      {logo ? (
        <img src={logo} alt={label} width={30} height={30} loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
      ) : (
        <span style={{ color: s.color }} className="text-[11px] font-semibold">{s.name.slice(0, 5)}</span>
      )}
      {visible && rect && createPortal(
        <span
          className="pointer-events-none fixed z-[70] -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-edge/15 bg-surface/90 px-2.5 py-1 font-mono text-[11px] text-bone backdrop-blur-xl"
          style={{ left: rect.left + rect.width / 2, top: rect.top - 10 }}
        >
          {label}
        </span>,
        document.body
      )}
    </div>
  );
}

export default function StackSection({ skills, settings, index }: { skills: Skill[]; settings: Settings; index: string }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  useDragMarquee(rowRef, 0.4, !!selected);

  useEffect(() => {
    if (!selected) return;
    const t = setTimeout(() => setSelected(null), 4000);
    return () => clearTimeout(t);
  }, [selected]);

  if (!skills.length) return null;
  const toggle = (id: string) => setSelected((cur) => (cur === id ? null : id));

  return (
    <section id="stack" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <SectionLabel index={index}>Skills</SectionLabel>
        {settings.stackTitle && (
          <Reveal>
            <h3 className="mb-3 max-w-2xl font-display text-3xl font-light text-bone sm:text-4xl [&_em]:italic [&_em]:text-mist" dangerouslySetInnerHTML={{ __html: settings.stackTitle }} />
          </Reveal>
        )}
        {settings.stackDescription && (
          <Reveal delay={0.1}>
            <p className="mb-14 max-w-xl text-base leading-relaxed text-mist [&_b]:font-medium [&_b]:text-silver" dangerouslySetInnerHTML={{ __html: settings.stackDescription }} />
          </Reveal>
        )}
      </div>

      <Reveal delay={0.15}>
        <div className="thin-scroll overflow-x-auto pb-16 pt-6" ref={rowRef}>
          <div className="flex w-max px-6 sm:px-10">
            {skills.map((s) => <Bubble s={s} key={s.id} selected={selected === s.id} onToggle={() => toggle(s.id)} />)}
            {skills.map((s) => <Bubble s={s} key={`${s.id}-dup`} selected={selected === s.id} onToggle={() => toggle(s.id)} />)}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
