import SectionLabel from "./SectionLabel";
import { RevealGroup, RevealItem } from "./Reveal";
import type { Achievement } from "../../lib/types";

export default function AchievementsSection({ achievements, index }: { achievements: Achievement[]; index: string }) {
  const visible = achievements.filter((a) => a.visible);
  if (!visible.length) return null;
  const sorted = [...visible].sort((a, b) => a.sortOrder - b.sortOrder);
  const lead = sorted.find((a) => a.highlight) ?? sorted[0];
  const rest = sorted.filter((a) => a.id !== lead.id);

  return (
    <section id="achievements" className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-24">
      <SectionLabel index={index}>Achievements</SectionLabel>

      <RevealGroup className="grid gap-4 sm:grid-cols-3">
        <RevealItem
          className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-edge/15 bg-surface/35 p-8 backdrop-blur-xl transition-all duration-300 hover:border-edge/25 hover:bg-surface/50 sm:col-span-2 sm:row-span-2"
          style={{ boxShadow: "0 30px 80px -40px rgb(var(--pr-accent) / 0.35)" }}
        >
          <div>
            <div className="mb-4 flex items-start justify-between">
              <span className="text-3xl">{lead.icon || "★"}</span>
              {lead.category && <span className="font-mono text-[10px] uppercase tracking-widest text-mist">{lead.category}</span>}
            </div>
            <h3 className="font-display text-2xl text-bone sm:text-3xl">{lead.title}</h3>
            {(lead.organization || lead.year) && <div className="mt-2 text-sm text-mist">{[lead.organization, lead.year].filter(Boolean).join(" · ")}</div>}
            <p className="mt-4 max-w-md text-sm leading-relaxed text-silver" dangerouslySetInnerHTML={{ __html: lead.description }} />
          </div>
          {lead.link && <a href={lead.link} target="_blank" rel="noopener" className="mt-6 inline-flex w-fit items-center gap-1 text-sm text-bone underline underline-offset-4">View ↗</a>}
        </RevealItem>

        {rest.map((a) => (
          <RevealItem
            key={a.id}
            className="rounded-2xl border border-edge/10 bg-surface/30 p-7 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-edge/20 hover:bg-surface/45"
          >
            <div className="mb-3 flex items-start justify-between">
              <span className="text-xl">{a.icon || "◆"}</span>
              {a.category && <span className="font-mono text-[10px] uppercase tracking-widest text-mist">{a.category}</span>}
            </div>
            <h4 className="font-display text-lg text-bone">{a.title}</h4>
            {(a.organization || a.year) && <div className="mt-1 text-xs text-mist">{[a.organization, a.year].filter(Boolean).join(" · ")}</div>}
            <p className="mt-3 text-sm leading-relaxed text-silver" dangerouslySetInnerHTML={{ __html: a.description }} />
            {a.link && <a href={a.link} target="_blank" rel="noopener" className="mt-4 inline-block text-xs text-bone underline underline-offset-4">View ↗</a>}
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
