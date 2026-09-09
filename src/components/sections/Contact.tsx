import SectionTag from "../ui/SectionTag";
import type { Settings } from "../../lib/types";

export default function Contact({ settings }: { settings: Settings }) {
  return (
    <div className="wrap">
      <section id="contact">
        <div className="sec-head reveal">
          <SectionTag>Contact</SectionTag>
        </div>
        <div className="contact-copy reveal">
          <div className="contact-text">
            <h2 dangerouslySetInnerHTML={{ __html: settings.contactHeading || "Got an interesting<br />problem? <em>Send it over.</em>" }} />
            <p dangerouslySetInnerHTML={{ __html: settings.contactDescription }} />
          </div>
          <div className="contact-row">
            <a className="btn btn-ghost" href={`mailto:${settings.email}`}>Email ↗</a>
            <a className="btn btn-ghost" href={settings.linkedin} target="_blank" rel="noopener">LinkedIn ↗</a>
            <a className="btn btn-ghost" href={settings.github} target="_blank" rel="noopener">GitHub ↗</a>
          </div>
        </div>
      </section>
    </div>
  );
}
