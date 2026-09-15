import type { Highlight } from "../../lib/types";
import SectionTag from "../ui/SectionTag";

/** Highlights of my work — a small gallery of standout moments (an award,
 *  a piece of recognition, an impact number), each optionally backed by a
 *  photo. Separate from Achievements, which is reserved for competition
 *  wins and other big-ticket recognitions. */
export default function Highlights({ highlights }: { highlights: Highlight[] }) {
  if (!highlights.length) return null;

  return (
    <div className="wrap">
      <section id="highlights">
        <div className="sec-head reveal">
          <SectionTag>Highlights</SectionTag>
        </div>
        <div className="hl-grid reveal">
          {highlights.map((h, i) => (
            <article className="hl-card" key={i}>
              {h.image && (
                <div className="hl-card-image">
                  <img src={h.image} alt="" loading="lazy" />
                </div>
              )}
              <div className="hl-card-body">
                <div className="hl-card-top">
                  <span className="hl-icon" aria-hidden="true">{h.icon || "🏅"}</span>
                  {h.headline && <h3 className="hl-headline">{h.headline}</h3>}
                </div>
                <p className="hl-text" dangerouslySetInnerHTML={{ __html: h.text }} />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
