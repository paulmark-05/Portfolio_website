import { createPortal } from "react-dom";

const icClose = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);

/** Full-screen image viewer shared by every section that lets you click a
 *  photo to see it bigger (project previews, highlight photos, …): blurred
 *  dark backdrop, a glass close button top right, dismiss on backdrop
 *  click or that button. Portaled to document.body — rendering it inside
 *  a card meant it inherited that card's CSS stacking context, so its
 *  z-index never actually out-ranked the fixed site nav. */
export default function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return createPortal(
    <div className="lightbox open" role="dialog" aria-modal="true"
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <button className="lightbox-close" aria-label="Close" onClick={onClose}>{icClose}</button>
      <img src={src} alt={alt} />
    </div>,
    document.body
  );
}
