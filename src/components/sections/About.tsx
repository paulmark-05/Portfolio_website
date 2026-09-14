import SectionTag from "../ui/SectionTag";
import type { Profile } from "../../lib/types";

export default function About({ profile }: { profile: Profile }) {
  return (
    <div className="wrap">
      <section id="about">
        <div className="sec-head reveal">
          <SectionTag>About</SectionTag>
        </div>
        <div className="about-copy reveal">
          {profile.aboutParagraphs.map((p, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
          ))}
          {profile.highlights.length > 0 && (
            <div className="highlights-grid">
              {profile.highlights.map((h, i) => (
                <div className="commend" key={i}>
                  <span className="commend-icon" aria-hidden="true">{h.icon || "🏅"}</span>
                  <div className="commend-body">
                    {h.headline && <div className="commend-headline">{h.headline}</div>}
                    <p dangerouslySetInnerHTML={{ __html: h.text }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
