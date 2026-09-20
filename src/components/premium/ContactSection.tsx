import SectionLabel from "./SectionLabel";
import { Reveal } from "./Reveal";
import type { Settings } from "../../lib/types";

export default function ContactSection({ settings, index }: { settings: Settings; index: string }) {
  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-28">
      <SectionLabel index={index}>Contact</SectionLabel>

      <Reveal>
        <h2
          className="max-w-3xl font-display text-4xl font-light leading-[1.1] text-bone sm:text-6xl [&_em]:italic [&_em]:text-mist"
          dangerouslySetInnerHTML={{ __html: settings.contactHeading || "Got an interesting<br />problem? <em>Send it over.</em>" }}
        />
      </Reveal>

      <Reveal delay={0.1}>
        <p className="mt-6 max-w-xl text-justify text-base leading-relaxed text-mist" dangerouslySetInnerHTML={{ __html: settings.contactDescription }} />
      </Reveal>

      <Reveal delay={0.2} className="mt-10 flex flex-wrap gap-4">
        <a href={`mailto:${settings.email}`} className="pr-btn-hover rounded-full bg-bone px-6 py-3 text-sm font-medium text-void shadow-[0_8px_30px_-10px_rgb(var(--pr-accent)/0.5)]">
          Email ↗
        </a>
        {settings.linkedin && (
          <a href={settings.linkedin} target="_blank" rel="noopener" className="pr-btn-hover rounded-full border border-edge/20 bg-surface/25 px-6 py-3 text-sm text-bone backdrop-blur-md hover:border-edge/40 hover:bg-surface/40">
            LinkedIn ↗
          </a>
        )}
        {settings.github && (
          <a href={settings.github} target="_blank" rel="noopener" className="pr-btn-hover rounded-full border border-edge/20 bg-surface/25 px-6 py-3 text-sm text-bone backdrop-blur-md hover:border-edge/40 hover:bg-surface/40">
            GitHub ↗
          </a>
        )}
      </Reveal>
    </section>
  );
}
