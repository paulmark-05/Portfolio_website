import { useState } from "react";
import SectionLabel from "./SectionLabel";
import { Reveal } from "./Reveal";
import CollageThumb from "./CollageThumb";
import MediaGallery from "../ui/MediaGallery";
import type { Highlight } from "../../lib/types";

export default function HighlightsSection({ highlights, index }: { highlights: Highlight[]; index: string }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  if (!highlights.length) return null;
  const open = openIdx !== null ? highlights[openIdx] : null;

  return (
    <section id="highlights" className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-24">
      <SectionLabel index={index}>Highlights</SectionLabel>

      {/* Each card gets its own Reveal (not a group stagger), so it fades
          in as it individually scrolls into view — one by one as you
          scroll, not all together when the section first appears. */}
      <div className="space-y-4">
        {highlights.map((h, i) => {
          const images = h.images ?? [];
          const hasPhoto = images.length > 0;
          return (
            <Reveal
              key={i}
              className={`group rounded-2xl border border-edge/10 bg-surface/30 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-edge/20 hover:bg-surface/45 sm:p-8 ${
                hasPhoto ? "grid gap-6 sm:grid-cols-[240px_1fr] sm:items-center" : ""
              }`}
            >
              {hasPhoto && (
                <button
                  type="button"
                  onClick={() => setOpenIdx(i)}
                  className="aspect-[16/9] w-full shrink-0 overflow-hidden rounded-lg border border-edge/10 sm:aspect-[4/3]"
                  aria-label={`View ${images.length > 1 ? `${images.length} photos` : "photo"} for ${h.headline || "this highlight"}`}
                >
                  <CollageThumb images={images} />
                </button>
              )}
              <div>
                {h.headline && <h3 className="font-display text-xl text-bone">{h.headline}</h3>}
                <p className="mt-3 text-justify text-sm leading-relaxed text-mist" dangerouslySetInnerHTML={{ __html: h.text }} />
              </div>
            </Reveal>
          );
        })}
      </div>

      {open && (
        <MediaGallery
          images={open.images}
          alt={open.headline || "Highlight photo"}
          onClose={() => setOpenIdx(null)}
        />
      )}
    </section>
  );
}
