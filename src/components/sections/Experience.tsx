import type { CSSProperties } from "react";
import type { Experience as Exp } from "../../lib/types";
import { resolveTech, techLogoUrl } from "../../lib/techRegistry";
import { colorForOrg, initialsOfOrg } from "../../lib/format";
import SectionTag from "../ui/SectionTag";

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

/** Pull the leading "Month YYYY" off a duration label, e.g.
 *  "Jul 2025 — Present · Kolkata" -> { label: "Jul 2025", key: 24307 }. */
function startOf(duration: string): { label: string; key: number } {
  const m = (duration || "").match(/([A-Za-z]{3,9})\.?\s+(\d{4})/);
  if (!m) return { label: duration || "", key: 0 };
  const mon = MONTHS[m[1].slice(0, 3).toLowerCase()] ?? 0;
  return { label: `${m[1].slice(0, 3)} ${m[2]}`, key: Number(m[2]) * 12 + mon };
}

/** Experience — a vertical timeline, strictly newest-start-first. Each node
 *  carries its own "Month YYYY" marker (a compact chronology rail down the
 *  left) and a connecting line that draws itself in as the node scrolls
 *  into view, reusing the site-wide IntersectionObserver reveal. */
export default function Experience({ experience }: { experience: Exp[] }) {
  const items = [...experience]
    .map((e) => ({ e, start: startOf(e.duration) }))
    .sort((a, b) => b.start.key - a.start.key || a.e.sortOrder - b.e.sortOrder);

  return (
    <div className="wrap">
      <section id="work">
        <div className="sec-head reveal">
          <SectionTag>Experience</SectionTag>
        </div>

        <ol className="exp-timeline">
          {items.map(({ e, start }, i) => {
            const ongoing = /present/i.test(e.duration);
            return (
              <li
                className={`exp-node reveal${ongoing ? " ongoing" : ""}`}
                key={e.id}
                style={{ "--org-color": colorForOrg(e.company) } as CSSProperties}
              >
                <span className="exp-node-date">{start.label}</span>
                <span className="exp-node-rail" aria-hidden="true">
                  <span className="exp-node-dot" />
                  {i < items.length - 1 && <span className="exp-node-line" />}
                </span>

                <div className="exp-node-card">
                  <div className="exp-tile-head">
                    <span className="exp-tile-badge">
                      {e.logo ? <img src={e.logo} alt="" /> : initialsOfOrg(e.company)}
                    </span>
                    <div className="exp-tile-text">
                      <h3 className="exp-tile-role">{e.role}</h3>
                      <span className="exp-tile-org">{e.company}</span>
                    </div>
                  </div>
                  <span className="exp-tile-when">{e.duration}</span>
                  {e.stepLabel && <div className="step"><span className="dot" />{e.stepLabel}</div>}
                  <p className="exp-tile-desc" dangerouslySetInnerHTML={{ __html: e.description }} />
                  {e.tags.length > 0 && (
                    <div className="exp-detail-tags">
                      {e.tags.map((t) => {
                        const tech = resolveTech(t);
                        const logo = techLogoUrl(tech);
                        return (
                          <span className="logo-chip" key={t} title={t} data-name={t}>
                            {logo
                              ? <img src={logo} alt={t} width={18} height={18} loading="lazy"
                                  onError={(ev) => { const el = ev.currentTarget as HTMLImageElement; el.style.display = "none"; (el.nextElementSibling as HTMLElement)?.style.removeProperty("display"); }} />
                              : null}
                            <span className="logo-fallback" style={{ display: logo ? "none" : "grid", background: tech.color }}>{tech.short.slice(0, 2)}</span>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
