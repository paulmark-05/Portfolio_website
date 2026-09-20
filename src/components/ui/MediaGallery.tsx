import { useState } from "react";
import { createPortal } from "react-dom";
import ImageLightbox, { icClose } from "./ImageLightbox";

/** Opened from a collage thumbnail with more than one photo: shows every
 *  photo at once in a grid (same blurred backdrop as the single-image
 *  lightbox), click one to zoom into it full-screen — reusing ImageLightbox
 *  for that stage, prev/next arrows included, so browsing the rest of the
 *  set from inside a zoomed photo still works. A single-photo set skips the
 *  grid entirely and zooms straight in, since a "grid" of one is pointless. */
export default function MediaGallery({
  images, alt, onClose,
}: {
  images: string[];
  alt: string;
  onClose: () => void;
}) {
  const [focus, setFocus] = useState<number | null>(images.length <= 1 ? 0 : null);

  if (focus !== null) {
    return <ImageLightbox images={images} index={focus} onIndexChange={setFocus} alt={alt} onClose={onClose} />;
  }

  return createPortal(
    <div
      className="lightbox gallery-grid"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
      tabIndex={-1}
      ref={(el) => el?.focus()}
    >
      <button className="lightbox-close" aria-label="Close" onClick={onClose}>{icClose}</button>
      <div className="gallery-grid-inner">
        {images.map((src, i) => (
          <button key={i} type="button" className="gallery-grid-item" onClick={() => setFocus(i)} aria-label={`View photo ${i + 1} of ${images.length}`}>
            <img src={src} alt="" loading="lazy" />
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
}
