import { useState } from "react";
import type { Highlight } from "../../lib/types";
import SectionTag from "../ui/SectionTag";
import ImageLightbox from "../ui/ImageLightbox";

/** Highlights of my work — an editorial-clippings layout: one lead story
 *  on the left, two shorter ones stacked on the right, all matching the
 *  same total height. Its own section — Achievements is reserved for
 *  competition wins and other big-ticket recognitions, not these smaller
 *  work highlights.
 *
 *  Each highlight can carry up to 3 photos. The lead card shows the first
 *  full-width, with the icon badged over its bottom-left corner; any
 *  extra photos show as a small stacked cluster over the bottom-right
 *  corner. Cards with no header photo (every brief, and a photo-less
 *  lead) show up to 3 small stacked thumbnails instead, with the icon
 *  beside the headline. Clicking any photo — hero, stack, or thumbnail —
 *  opens the same full-screen gallery, starting on that photo, with
 *  prev/next to browse the rest. */
export default function Highlights({ highlights }: { highlights: Highlight[] }) {
  const [gallery, setGallery] = useState<{ h: number; photo: number } | null>(null);
  if (!highlights.length) return null;
  const openHighlight = gallery ? highlights[gallery.h] : null;

  return (
    <div className="wrap">
      <section id="highlights">
        <div className="sec-head reveal">
          <SectionTag>Highlights</SectionTag>
        </div>
        <div className="hl-grid reveal">
          {highlights.map((h, i) => {
            const isLead = i === 0;
            const images = h.images ?? [];
            const hasLeadImage = isLead && images.length > 0;
            const stackImages = hasLeadImage ? images.slice(1, 3) : images.slice(0, 3);

            return (
              <article className={`hl-card${isLead ? " hl-lead" : ""}`} key={i}>
                {hasLeadImage && (
                  <div className="hl-card-image-wrap">
                    <button
                      type="button"
                      className="hl-card-image clickable"
                      onClick={() => setGallery({ h: i, photo: 0 })}
                      aria-label={`View full photo for ${h.headline || "this highlight"}`}
                    >
                      <img src={images[0]} alt="" loading="lazy" />
                      <span className="hl-image-expand">View full ↗</span>
                    </button>
                    <span className="hl-icon hl-icon-onimage" aria-hidden="true">{h.icon || "🏅"}</span>
                    {stackImages.length > 0 && (
                      <div className="hl-thumb-stack hl-thumb-stack-onimage">
                        {stackImages.map((src, pi) => (
                          <button
                            type="button"
                            className="hl-thumb"
                            key={pi}
                            onClick={() => setGallery({ h: i, photo: pi + 1 })}
                            aria-label={`View photo ${pi + 2} for ${h.headline || "this highlight"}`}
                          >
                            <img src={src} alt="" loading="lazy" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="hl-card-body">
                  {!hasLeadImage && stackImages.length > 0 && (
                    <div className="hl-thumb-stack">
                      {stackImages.map((src, pi) => (
                        <button
                          type="button"
                          className="hl-thumb"
                          key={pi}
                          onClick={() => setGallery({ h: i, photo: pi })}
                          aria-label={`View photo ${pi + 1} for ${h.headline || "this highlight"}`}
                        >
                          <img src={src} alt="" loading="lazy" />
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="hl-headline-row">
                    {!hasLeadImage && <span className="hl-icon" aria-hidden="true">{h.icon || "🏅"}</span>}
                    {h.headline && <h3 className="hl-headline">{h.headline}</h3>}
                  </div>
                  <p className="hl-text" dangerouslySetInnerHTML={{ __html: h.text }} />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {openHighlight && (
        <ImageLightbox
          images={openHighlight.images}
          index={gallery!.photo}
          onIndexChange={(photo) => setGallery({ h: gallery!.h, photo })}
          alt={openHighlight.headline || "Highlight photo"}
          onClose={() => setGallery(null)}
        />
      )}
    </div>
  );
}
