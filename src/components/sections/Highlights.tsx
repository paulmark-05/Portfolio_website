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
 *  Any number of photos per highlight: the first is the card's main
 *  photo, and if there are more, they show as a native-scroll filmstrip
 *  underneath — swipe/drag through them, no arrow buttons needed on the
 *  card itself. Clicking the main photo or any filmstrip thumbnail opens
 *  the full-screen gallery lightbox on that exact photo, with prev/next
 *  to browse the rest. Cards with no photo show the icon beside the
 *  headline instead of over a photo corner. */
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
            const hasPhoto = images.length > 0;

            return (
              <article className={`hl-card${isLead ? " hl-lead" : ""}`} key={i}>
                {hasPhoto && (
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
                  </div>
                )}
                {images.length > 1 && (
                  <div className="hl-filmstrip">
                    {images.map((src, pi) => (
                      <button
                        type="button"
                        className={`hl-filmstrip-thumb${pi === 0 ? " is-active" : ""}`}
                        key={pi}
                        onClick={() => setGallery({ h: i, photo: pi })}
                        aria-label={`View photo ${pi + 1} of ${images.length} for ${h.headline || "this highlight"}`}
                      >
                        <img src={src} alt="" loading="lazy" />
                      </button>
                    ))}
                  </div>
                )}
                <div className="hl-card-body">
                  <div className="hl-headline-row">
                    {!hasPhoto && <span className="hl-icon" aria-hidden="true">{h.icon || "🏅"}</span>}
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
