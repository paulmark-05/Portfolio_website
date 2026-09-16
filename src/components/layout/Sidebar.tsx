import { useEffect, useState } from "react";
import { initialsOf } from "../../lib/format";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import type { Profile, Settings } from "../../lib/types";
import ImageLightbox from "../ui/ImageLightbox";

const icLinkedIn = (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.94 5a2 2 0 1 1-4-.02 2 2 0 0 1 4 .02M7 8.48H3V21h4zM20.34 21h4v-7.07c0-3.87-2.06-5.67-4.81-5.67a4.19 4.19 0 0 0-3.76 2h-.06V8.48h-4v12.5h4v-6.19c0-1.63.31-3.21 2.33-3.21s2.29 1.86 2.29 3.31z" /></svg>
);
const icGitHub = (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.4 9.4 0 0 1 5 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2" /></svg>
);
const icPin = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-6.5 7-11.5a7 7 0 1 0-14 0C5 14.5 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
);
const icMail = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" /></svg>
);
const icChevron = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6" /></svg>
);

/** Rotating role line — slides a new title in every few seconds. */
function RoleScroll({ roles }: { roles: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (roles.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % roles.length), 2600);
    return () => clearInterval(t);
  }, [roles]);
  if (!roles.length) return null;
  return (
    <div className="role-scroll" aria-live="polite">
      <span key={i} className="role-scroll-item">{roles[i]}<span className="caret" /></span>
    </div>
  );
}

/** Sticky left profile sidebar — photo, name, role, location, socials, and a
 *  contact button. Stays pinned beside the content column on desktop, and
 *  sits as a normal block above it on mobile. Retractable via `onToggle` —
 *  the handle stays put at the sidebar's edge even while it's collapsed. */
export default function Sidebar({ profile, settings, open, onToggle }: { profile: Profile; settings: Settings; open: boolean; onToggle: () => void }) {
  const [imgFailed, setImgFailed] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const hasPhoto = !!profile.heroImage && !imgFailed;

  const cleanRoles = (profile.roles || []).filter(Boolean);
  const roles = cleanRoles.length ? cleanRoles : [profile.title].filter(Boolean);
  const facts = (profile.infoCards || []).filter((c) => c.visible && c.text);
  const locationFact = facts.find((c) => c.icon === "📍" || /,/.test(c.text));
  const mapsHref = locationFact ? `https://www.google.com/maps/search/${encodeURIComponent(locationFact.text)}` : "";
  // the collapse behaviour (and its keyboard/AT implications) only applies
  // once the sidebar is a real sticky column — on mobile it's always a
  // normal, fully-interactive block regardless of the desktop toggle state.
  const isDesktop = useMediaQuery("(min-width: 901px)");
  const collapsed = isDesktop && !open;

  return (
    <aside className="sidebar">
      <button
        className="sidebar-toggle"
        onClick={onToggle}
        aria-label={open ? "Hide sidebar" : "Show sidebar"}
        aria-expanded={open}
      >
        {icChevron}
      </button>
      <div className="sidebar-content" inert={collapsed ? "" : undefined}>
      {hasPhoto ? (
        <button
          type="button"
          className="sidebar-photo clickable"
          onClick={() => setLightbox(true)}
          aria-label={`View full photo of ${profile.name}`}
        >
          <img src={profile.heroImage} alt={profile.name} onError={() => setImgFailed(true)} />
          <span className="sidebar-photo-expand">View full ↗</span>
        </button>
      ) : (
        <div className="sidebar-photo">
          <span className="sidebar-photo-mono">{initialsOf(profile.name)}</span>
        </div>
      )}

      <h1 className="sidebar-name">Hello, I&rsquo;m <em>{profile.name}</em></h1>
      <RoleScroll roles={roles} />

      {facts.length > 0 && (
        <ul className="sidebar-facts">
          {facts.map((c, i) => (
            <li key={i}><span className="sidebar-facts-icon" aria-hidden="true">{c.icon || "•"}</span>{c.text}</li>
          ))}
        </ul>
      )}

      {profile.availabilityBadge && (
        <div className="sidebar-status"><span className="dot" />{profile.availabilityBadge}</div>
      )}

      <div className="sidebar-socials">
        {settings.linkedin && <a href={settings.linkedin} target="_blank" rel="noopener" aria-label="LinkedIn profile" title="LinkedIn">{icLinkedIn}</a>}
        {settings.github && <a href={settings.github} target="_blank" rel="noopener" aria-label="GitHub profile" title="GitHub">{icGitHub}</a>}
        {settings.email && <a href={`mailto:${settings.email}`} aria-label="Email" title={settings.email}>{icMail}</a>}
        {mapsHref && <a href={mapsHref} target="_blank" rel="noopener" aria-label={`Location: ${locationFact!.text}`} title={locationFact!.text}>{icPin}</a>}
      </div>
      </div>

      {lightbox && hasPhoto && (
        <ImageLightbox src={profile.heroImage} alt={profile.name} onClose={() => setLightbox(false)} />
      )}
    </aside>
  );
}
