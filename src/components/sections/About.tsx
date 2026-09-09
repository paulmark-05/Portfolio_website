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
          {profile.commendation && (
            <div className="commend">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="9" r="6" /><path d="M9 13l-2 8 5-3 5 3-2-8" /></svg>
              <p dangerouslySetInnerHTML={{ __html: profile.commendation }} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
