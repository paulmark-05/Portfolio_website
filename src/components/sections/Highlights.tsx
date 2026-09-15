import { useState } from "react";
import type { Highlight } from "../../lib/types";
import SectionTag from "../ui/SectionTag";
import ImageLightbox from "../ui/ImageLightbox";

/** Highlights of my work — an editorial-clippings layout: one lead story
 *  on the left, two shorter ones stacked on the right, all matching the
 *  same total height. Its own section — Achievements is reserved for
 *  competition wins and other big-ticket recognitions, not these smaller
 *  work highlights. The lead card shows its photo full-width; the shorter
 *  cards show a small corner thumbnail instead so one long caption can't
 *  blow a tile's height out. Either way, a photo opens in the same
 *  full-screen lightbox the project previews use. */
export default function Highlights({ highlights }: { highlights: Highlight[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  if (!highlights.length) return null;
  const open = openIdx != null ? highlights[openIdx] : null;

  return (
    <div className="wrap">
      <section id="highlights">
        <div className="sec-head reveal">
          <SectionTag>Highlights</SectionTag>
        </div>
        <div className="hl-grid reveal">
          {highlights.map((h, i) => {
            const isLead = i === 0;
            return (
              <article className={`hl-card${isLead ? " hl-lead" : ""}`} key={i}>
                {isLead && h.image && (
                  <button
                    type="button"
                    className="hl-card-image clickable"
                    onClick={() => setOpenIdx(i)}
                    aria-label={`View full photo for ${h.headline || "this highlight"}`}
                  >
                    <img src={h.image} alt="" loading="lazy" />
                    <span className="hl-image-expand">View full ↗</span>
                  </button>
                )}
                <div className="hl-card-body">
                  <div className="hl-card-top">
                    <div className="hl-kicker-row">
                      <span className="hl-icon" aria-hidden="true">{h.icon || "🏅"}</span>
                      <span className="hl-kicker">Highlight</span>
                    </div>
                    {!isLead && h.image && (
                      <button
                        type="button"
                        className="hl-thumb"
                        onClick={() => setOpenIdx(i)}
                        aria-label={`View full photo for ${h.headline || "this highlight"}`}
                      >
                        <img src={h.image} alt="" loading="lazy" />
                      </button>
                    )}
                  </div>
                  {h.headline && <h3 className="hl-headline">{h.headline}</h3>}
                  <p className="hl-text" dangerouslySetInnerHTML={{ __html: h.text }} />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {open && open.image && (
        <ImageLightbox src={open.image} alt={open.headline || "Highlight photo"} onClose={() => setOpenIdx(null)} />
      )}
    </div>
  );
}
