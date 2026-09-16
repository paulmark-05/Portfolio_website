import { createPortal } from "react-dom";

const icClose = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);
const icChevron = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
);

/** Full-screen image viewer shared by every section that lets you click a
 *  photo to see it bigger (project previews, highlight photos, …): blurred
 *  dark backdrop, a glass close button top right, dismiss on backdrop
 *  click or that button. Portaled to document.body — rendering it inside
 *  a card meant it inherited that card's CSS stacking context, so its
 *  z-index never actually out-ranked the fixed site nav.
 *
 *  Pass either a single `src`, or a gallery via `images` + `index` +
 *  `onIndexChange` — prev/next arrows (and left/right arrow keys) only
 *  show up once there's more than one photo to browse. An optional
 *  `caption` shows underneath the photo (e.g. a warm greeting on the
 *  profile photo) — plain single-image callers just leave it out. */
export default function ImageLightbox({
  src, images, index = 0, onIndexChange, alt, caption, onClose,
}: {
  src?: string;
  images?: string[];
  index?: number;
  onIndexChange?: (i: number) => void;
  alt: string;
  caption?: string;
  onClose: () => void;
}) {
  const list = images ?? (src ? [src] : []);
  const current = list[index] ?? list[0];
  const hasNav = list.length > 1 && !!onIndexChange;

  const go = (dir: -1 | 1) => {
    if (!onIndexChange) return;
    onIndexChange((index + dir + list.length) % list.length);
  };

  return createPortal(
    <div className={`lightbox open${caption ? " has-caption" : ""}`} role="dialog" aria-modal="true"
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
         onKeyDown={(e) => {
           if (e.key === "Escape") onClose();
           else if (hasNav && e.key === "ArrowLeft") go(-1);
           else if (hasNav && e.key === "ArrowRight") go(1);
         }}
         tabIndex={-1}
         ref={(el) => el?.focus()}
    >
      <button className="lightbox-close" aria-label="Close" onClick={onClose}>{icClose}</button>
      {hasNav && (
        <>
          <button className="lightbox-nav lightbox-prev" aria-label="Previous photo" onClick={() => go(-1)}>{icChevron}</button>
          <button className="lightbox-nav lightbox-next" aria-label="Next photo" onClick={() => go(1)}>{icChevron}</button>
          <span className="lightbox-count">{index + 1} / {list.length}</span>
        </>
      )}
      <img src={current} alt={alt} />
      {caption && <p className="lightbox-caption">{caption}</p>}
    </div>,
    document.body
  );
}
