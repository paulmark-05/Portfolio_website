import SectionLabel from "./SectionLabel";
import { Reveal, RevealGroup, RevealItem } from "./Reveal";
import type { Profile } from "../../lib/types";

export default function AboutSection({ profile, index }: { profile: Profile; index: string }) {
  const facts = (profile.quickFacts || []).filter((f) => f.value);

  return (
    <section id="about" className="mx-auto max-w-6xl px-6 pb-16 pt-28 sm:px-10 sm:pb-24 lg:pt-16">
      <SectionLabel index={index}>{profile.aboutTitle || "About"}</SectionLabel>

      <div className="w-full space-y-6">
        {profile.aboutParagraphs.map((p, i) => (
          <Reveal key={i} delay={i * 0.08}>
            <p
              className="text-justify text-lg leading-relaxed text-silver sm:text-xl [&_b]:font-medium [&_b]:text-bone"
              dangerouslySetInnerHTML={{ __html: p }}
            />
          </Reveal>
        ))}
      </div>

      {facts.length > 0 && (
        <RevealGroup className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {facts.map((f, i) => (
            <RevealItem
              key={i}
              className="rounded-2xl border border-edge/10 bg-surface/30 px-6 py-5 backdrop-blur-xl transition-all duration-300 hover:border-edge/20 hover:bg-surface/45"
            >
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-mist">{f.label}</div>
              <div className="mt-1.5 text-lg text-bone">{f.value}</div>
            </RevealItem>
          ))}
        </RevealGroup>
      )}
    </section>
  );
}
