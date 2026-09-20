import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SectionLabel from "./SectionLabel";
import { Reveal } from "./Reveal";
import type { Certification } from "../../lib/types";

export default function CertsSection({ certs: certsProp, index }: { certs: Certification[]; index: string }) {
  const certs = useMemo(() => [...certsProp].sort((a, b) => a.sortOrder - b.sortOrder), [certsProp]);
  const [idx, setIdx] = useState(0);
  if (!certs.length) return null;
  const active = certs[idx];

  return (
    <section id="certs" className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-24">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1"><SectionLabel index={index}>Certificates</SectionLabel></div>
        <span className="mt-1 font-mono text-xs text-mist">{certs.length} earned</span>
      </div>

      <Reveal className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <div className="thin-scroll flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {certs.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setIdx(i)}
              className={`pr-btn-hover flex shrink-0 items-center gap-3 rounded-xl border px-4 py-3 text-left backdrop-blur-xl lg:shrink ${
                i === idx ? "border-edge/35 bg-surface/45" : "border-edge/10 bg-surface/20 hover:border-edge/25 hover:bg-surface/35"
              }`}
            >
              <span className="font-mono text-xs text-mist">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-[160px]">
                <span className="block text-sm text-bone">{c.title}</span>
                <span className="block text-xs text-mist">{c.issuer}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-edge/12 bg-surface/30 backdrop-blur-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex aspect-[4/3] items-center justify-center border-b border-edge/10 bg-surface/50 sm:aspect-[16/10]">
                {active.image ? (
                  <img src={active.image} alt={active.title} loading="lazy" className="h-full w-full object-contain p-4" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <span className="font-mono text-xs uppercase tracking-widest text-mist">Certificate</span>
                )}
              </div>
              <div className="p-8">
                <h3 className="font-display text-2xl text-bone">{active.title}</h3>
                <div className="mt-2 text-sm text-mist">{active.issuer} · {active.dateLabel}</div>
                {active.description && <p className="mt-4 text-justify text-sm leading-relaxed text-silver" dangerouslySetInnerHTML={{ __html: active.description }} />}
                {active.image && (
                  <a href={active.image} download target="_blank" rel="noopener" className="pr-btn-hover mt-6 inline-block rounded-full border border-edge/20 bg-surface/25 px-5 py-2 text-xs text-bone backdrop-blur-md hover:border-edge/40 hover:bg-surface/40">
                    Download ↓
                  </a>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Reveal>
    </section>
  );
}
