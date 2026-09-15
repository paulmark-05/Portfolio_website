import { useState } from "react";
import type { Project } from "../../lib/types";
import { resolveTech, techLogoUrl } from "../../lib/techRegistry";
import { useSpotlight } from "../../hooks/useSpotlight";
import ImageLightbox from "./ImageLightbox";

const icArrow = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M9 7h8v8" /></svg>
);
const icCode = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
);
const icPlay = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
);

/** One horizontal project row: preview LEFT, content CENTER, actions RIGHT.
 *  Shared by the homepage Selected Work and the /projects archive. */
export default function ProjectRow({ p }: { p: Project }) {
  const [imgFailed, setImgFailed] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const hasImage = !!p.image && !imgFailed;
  const { ref: spotRef, onMouseMove } = useSpotlight<HTMLElement>();

  // No screenshot yet: a designed cover (monogram + primary tech mark) reads
  // far more finished than a bare "preview coming soon" placeholder.
  const primaryTech = p.techStack.length ? resolveTech(p.techStack[0]) : null;
  const coverLogo = primaryTech ? techLogoUrl(primaryTech) : "";
  const monogram = (p.title || "?").trim().charAt(0).toUpperCase();

  // Mobile KPI card pulls the first highlighted metric out of the
  // description (the <span class="m"> markers already used for emphasis).
  const kpiMatch = p.description.match(/<span class="m">([^<]+)<\/span>/);
  const kpi = kpiMatch ? kpiMatch[1] : null;

  return (
    <>
      <article className="proj-row spotlight reveal" ref={spotRef} onMouseMove={onMouseMove}>
        <div
          className={`proj-row-preview${hasImage ? " clickable" : ""}`}
          onClick={hasImage ? () => setLightbox(true) : undefined}
          role={hasImage ? "button" : undefined}
          tabIndex={hasImage ? 0 : undefined}
          aria-label={hasImage ? `View full preview of ${p.title}` : undefined}
          onKeyDown={hasImage ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setLightbox(true); } } : undefined}
        >
          {hasImage ? (
            <>
              <img alt="" loading="lazy" src={p.image} onError={() => setImgFailed(true)} />
              <span className="proj-preview-expand">View full ↗</span>
            </>
          ) : (
            <div className="proj-cover" style={primaryTech ? { "--cover-tint": primaryTech.color } as React.CSSProperties : undefined}>
              <span className="proj-cover-mono">{monogram}</span>
              {coverLogo && <img className="proj-cover-logo" src={coverLogo} alt="" loading="lazy" />}
            </div>
          )}
        </div>

        <div className="proj-row-body">
          <div className="proj-row-head">
            <h3>{p.title}</h3>
            {p.active && <span className="activebadge"><span className="adot" />Active</span>}
            <span className="date">{p.dateLabel}</span>
          </div>
          {kpi && <div className="proj-kpi"><b>{kpi}</b></div>}
          <p className="desc" dangerouslySetInnerHTML={{ __html: p.description }} />
          <div className="logos">
            {p.techStack.map((s) => {
              const t = resolveTech(s);
              const logo = techLogoUrl(t);
              return (
                <span className="logo-chip" key={s} title={s} data-name={s}>
                  {logo
                    ? <img src={logo} alt={s} width={20} height={20} loading="lazy"
                        onError={(e) => { const el = e.currentTarget as HTMLImageElement; el.style.display = "none"; (el.nextElementSibling as HTMLElement)?.style.removeProperty("display"); }} />
                    : null}
                  <span className="logo-fallback" style={{ display: logo ? "none" : "grid", background: t.color }}>{t.short.slice(0, 2)}</span>
                </span>
              );
            })}
          </div>
        </div>

        <div className="proj-row-actions">
          {p.githubUrl && <a className="plink" href={p.githubUrl} target="_blank" rel="noopener">{icCode} Code</a>}
          {p.liveUrl && <a className="plink live" href={p.liveUrl} target="_blank" rel="noopener">{icArrow} Live site</a>}
          {p.demoUrl && <a className="plink" href={p.demoUrl} target="_blank" rel="noopener">{icPlay} Demo</a>}
        </div>
      </article>

      {lightbox && hasImage && (
        <ImageLightbox src={p.image} alt={p.title} onClose={() => setLightbox(false)} />
      )}
    </>
  );
}
