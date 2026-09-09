import { useMemo, useRef, useState } from "react";
import type { Certification } from "../../lib/types";
import SectionTag from "../ui/SectionTag";

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

/** Turn a date label ("Apr 2026", "2025") into a sortable "month index"
 *  so the list can be ordered newest-first automatically, regardless of
 *  the order certs were entered in. */
function dateKeyOf(label: string): number {
  const my = (label || "").match(/([A-Za-z]{3,9})\.?\s+(\d{4})/);
  if (my) return Number(my[2]) * 12 + (MONTHS[my[1].slice(0, 3).toLowerCase()] ?? 0);
  const y = (label || "").match(/(\d{4})/);
  return y ? Number(y[1]) * 12 : 0;
}

/** Certificates — clean two-pane viewer: a certificate LIST on the left, a single
 *  selected card on the right (fade/slide on change). No carousel, no arrows,
 *  no faded side cards. */
export default function Certs({ certs: certsProp }: { certs: Certification[] }) {
  const certs = useMemo(
    () => [...certsProp].sort((a, b) => dateKeyOf(b.dateLabel) - dateKeyOf(a.dateLabel) || a.sortOrder - b.sortOrder),
    [certsProp]
  );
  const [idx, setIdx] = useState(0);
  const [modal, setModal] = useState(false);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  if (!certs.length) return null;
  const active = certs[idx];

  const select = (i: number) => {
    setIdx(i);
    itemRefs.current[i]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  return (
    <div className="wrap">
      <section id="certs">
        <div className="sec-head reveal">
          <SectionTag>Certificates</SectionTag>
          <span className="proj-counter">{certs.length} earned</span>
        </div>

        <div className="certs-layout reveal">
          {/* LEFT — selectable list */}
          <aside className="certs-list">
            {certs.map((c, i) => (
              <button
                key={c.id}
                ref={(el) => { itemRefs.current[i] = el; }}
                className={`certs-list-item${i === idx ? " active" : ""}`}
                onClick={() => select(i)}
              >
                <span className="cli-title">{c.title}</span>
              </button>
            ))}
          </aside>

          {/* RIGHT — single selected certificate card */}
          <div className="cert-single">
            <article className="cert-single-card" key={active.id}>
              <div className="cert-single-preview" onClick={() => setModal(true)}>
                <img alt={active.title} loading="lazy" src={active.image}
                     onError={(e) => { const t = e.currentTarget as HTMLImageElement; const ph = t.parentElement?.querySelector(".placeholder") as HTMLElement; if (ph) ph.style.display = "grid"; t.style.display = "none"; }} />
                <span className="placeholder">Certificate Preview</span>
                <span className="cert-single-expand">View full ↗</span>
              </div>
              <div className="cert-single-body">
                <h3>{active.title}</h3>
                <div className="cert-single-meta">
                  <span>{active.issuer}</span>
                  <span className="dotsep">·</span>
                  <span>{active.dateLabel}</span>
                </div>
                {active.description && <p dangerouslySetInnerHTML={{ __html: active.description }} />}
                <div className="cert-actions">
                  <button className="btn btn-ghost cert-cred" onClick={() => setModal(true)}>View credential ↗</button>
                  {active.image && <a className="btn btn-ghost cert-cred" href={active.image} download target="_blank" rel="noopener">Download ↓</a>}
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {modal && (
        <div className="cert-modal open" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) setModal(false); }}>
          <div className="cert-modal-inner">
            <div className="cert-modal-head">
              <div>
                <h4>{active.title}</h4>
                <div className="meta">{active.issuer} · {active.dateLabel}</div>
              </div>
              <button className="cert-modal-close" aria-label="Close" onClick={() => setModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="cert-modal-body">
              <img alt={active.title} src={active.image}
                   onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
