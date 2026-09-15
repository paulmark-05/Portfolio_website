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
        </div>
      </section>
    </div>
  );
}
