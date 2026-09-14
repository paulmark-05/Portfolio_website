import type { Achievement } from "../../lib/types";
import SectionTag from "../ui/SectionTag";

/** Achievements — premium minimal cards (Linear/Stripe/Vercel feel). A
 *  highlighted achievement leads, the rest flow in a responsive grid. */
export default function Achievements({ achievements }: { achievements: Achievement[] }) {
  if (!achievements.length) return null;
  const sorted = [...achievements].sort((a, b) => a.sortOrder - b.sortOrder);
  const lead = sorted.find((a) => a.highlight) ?? sorted[0];
  const rest = sorted.filter((a) => a.id !== lead.id);

  return (
    <div className="wrap">
      <section id="achievements">
        <div className="sec-head reveal">
          <SectionTag>Achievements</SectionTag>
        </div>

        {/* single bento grid — the lead tile spans 2x2, the rest fill in
            around it, so this reads right whether there's 1 achievement
            or a dozen. */}
        <div className="ach-bento reveal">
          <article className="ach-card ach-lead">
            <div className="ach-top">
              <span className="ach-icon">{lead.icon || "★"}</span>
              <div className="ach-top-right">
                {lead.category && <span className="ach-cat">{lead.category}</span>}
                {lead.image && (
                  <a className="ach-thumb" href={lead.image} target="_blank" rel="noopener" aria-label="View proof photo">
                    <img src={lead.image} alt="" loading="lazy" />
                  </a>
                )}
              </div>
            </div>
            <h3>{lead.title}</h3>
            {(lead.organization || lead.year) && <div className="ach-meta">{[lead.organization, lead.year].filter(Boolean).join(" · ")}</div>}
            <p dangerouslySetInnerHTML={{ __html: lead.description }} />
            {lead.link && <a className="ach-link" href={lead.link} target="_blank" rel="noopener">View ↗</a>}
            <span className="ach-glow" aria-hidden="true" />
          </article>

          {rest.map((a) => (
            <article className={`ach-card${a.highlight ? " is-hi" : ""}`} key={a.id}>
              <div className="ach-top">
                <span className="ach-icon">{a.icon || "◆"}</span>
                <div className="ach-top-right">
                  {a.category && <span className="ach-cat">{a.category}</span>}
                  {a.image && (
                    <a className="ach-thumb" href={a.image} target="_blank" rel="noopener" aria-label="View proof photo">
                      <img src={a.image} alt="" loading="lazy" />
                    </a>
                  )}
                </div>
              </div>
              <h4>{a.title}</h4>
              {(a.organization || a.year) && <div className="ach-meta">{[a.organization, a.year].filter(Boolean).join(" · ")}</div>}
              <p dangerouslySetInnerHTML={{ __html: a.description }} />
              {a.link && <a className="ach-link" href={a.link} target="_blank" rel="noopener">View ↗</a>}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
