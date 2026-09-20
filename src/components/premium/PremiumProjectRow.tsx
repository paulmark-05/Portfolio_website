import { useState } from "react";
import { motion } from "framer-motion";
import type { Project } from "../../lib/types";
import { resolveTech } from "../../lib/techRegistry";
import TechBubble from "./TechBubble";
import ImageLightbox from "../ui/ImageLightbox";

const icArrow = <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M9 7h8v8" /></svg>;
const icCode = <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>;
const icPlay = <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>;

export default function PremiumProjectRow({ p, index = 0 }: { p: Project; index?: number }) {
  const [imgFailed, setImgFailed] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const hasImage = !!p.image && !imgFailed;
  const primaryTech = p.techStack.length ? resolveTech(p.techStack[0]) : null;
  const monogram = (p.title || "?").trim().charAt(0).toUpperCase();

  return (
    <>
      <motion.article
        id={`project-${p.id}`}
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
        transition={{ duration: 0.8, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
        className="group grid scroll-mt-36 gap-6 rounded-2xl border-t border-edge/10 px-4 -mx-4 py-10 transition-colors duration-300 first:border-t-0 hover:bg-surface/15 sm:grid-cols-[220px_1fr_auto] sm:items-center sm:gap-8 sm:px-6 sm:-mx-6"
      >
        <button
          type="button"
          onClick={hasImage ? () => setLightbox(true) : undefined}
          aria-label={hasImage ? `View full preview of ${p.title}` : undefined}
          className={`relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-edge/12 bg-surface/30 backdrop-blur-xl ${hasImage ? "cursor-pointer" : "cursor-default"}`}
        >
          {hasImage ? (
            <img src={p.image} alt="" loading="lazy" onError={() => setImgFailed(true)} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full items-center justify-center" style={{ background: primaryTech ? `linear-gradient(135deg, ${primaryTech.color}22, transparent)` : undefined }}>
              <span className="font-display text-4xl text-bone/20">{monogram}</span>
            </div>
          )}
        </button>

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-display text-xl text-bone sm:text-2xl">{p.title}</h3>
            {p.active && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-edge/15 bg-surface/35 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-silver backdrop-blur-md">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />Active
              </span>
            )}
            <span className="font-mono text-xs text-mist">{p.dateLabel}</span>
          </div>
          <p className="mt-3 max-w-xl text-justify text-sm leading-relaxed text-silver [&_.m]:font-medium [&_.m]:text-bone" dangerouslySetInnerHTML={{ __html: p.description }} />
          <div className="mt-4 flex flex-wrap gap-3">
            {p.techStack.map((s) => <TechBubble key={s} name={s} size={30} />)}
          </div>
        </div>

        <div className="flex gap-4 sm:flex-col sm:items-end sm:gap-2">
          {p.githubUrl && <a className="flex items-center gap-1.5 text-xs text-mist transition-colors hover:text-bone" href={p.githubUrl} target="_blank" rel="noopener">{icCode} Code</a>}
          {p.liveUrl && <a className="flex items-center gap-1.5 text-xs text-bone" href={p.liveUrl} target="_blank" rel="noopener">{icArrow} Live</a>}
          {p.demoUrl && <a className="flex items-center gap-1.5 text-xs text-mist transition-colors hover:text-bone" href={p.demoUrl} target="_blank" rel="noopener">{icPlay} Demo</a>}
        </div>
      </motion.article>

      {lightbox && hasImage && <ImageLightbox src={p.image} alt={p.title} onClose={() => setLightbox(false)} />}
    </>
  );
}
