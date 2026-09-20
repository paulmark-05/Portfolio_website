// Minimal line icons for the side nav — plain functional glyphs, not a
// brand mark, kept as inline SVG so nothing here reads as a "logo".
const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const icHome = (
  <svg {...common}><path d="M4 11.5 12 4l8 7.5" /><path d="M6 10v9h12v-9" /><path d="M10 19v-5h4v5" /></svg>
);
export const icUser = (
  <svg {...common}><circle cx="12" cy="8" r="3.4" /><path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5" /></svg>
);
export const icStar = (
  <svg {...common}><path d="M12 3.5l2.5 5.4 5.8.6-4.4 3.9 1.3 5.8L12 16.3l-5.2 2.9 1.3-5.8-4.4-3.9 5.8-.6z" /></svg>
);
export const icBriefcase = (
  <svg {...common}><rect x="3.5" y="7.5" width="17" height="11.5" rx="1.8" /><path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5" /><path d="M3.5 12.5h17" /></svg>
);
export const icTerminal = (
  <svg {...common}><rect x="3.5" y="4.5" width="17" height="15" rx="1.8" /><path d="M7.5 10l3 2.5-3 2.5" /><path d="M13 15h4" /></svg>
);
export const icAward = (
  <svg {...common}><circle cx="12" cy="9" r="5" /><path d="M9 13.3 7.5 20l4.5-2.3 4.5 2.3-1.5-6.7" /></svg>
);
export const icGrid = (
  <svg {...common}><rect x="4" y="4" width="7" height="7" rx="1.4" /><rect x="13" y="4" width="7" height="7" rx="1.4" /><rect x="4" y="13" width="7" height="7" rx="1.4" /><rect x="13" y="13" width="7" height="7" rx="1.4" /></svg>
);
export const icRibbon = (
  <svg {...common}><circle cx="12" cy="8.5" r="4.5" /><path d="M9 12.3 7 20l5-2.5 5 2.5-2-7.7" /></svg>
);
export const icMail = (
  <svg {...common}><rect x="3.5" y="5.5" width="17" height="13" rx="1.8" /><path d="m4.5 7 7.5 6 7.5-6" /></svg>
);
export const icFile = (
  <svg {...common}><path d="M7 3.5h7l4 4v13H7z" /><path d="M14 3.5v4h4" /><path d="M9.5 13h5M9.5 16h5" /></svg>
);
export const icGithub = (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.58 2 12.2c0 4.5 2.87 8.32 6.84 9.67.5.1.68-.22.68-.49v-1.72c-2.78.62-3.37-1.37-3.37-1.37-.46-1.2-1.11-1.52-1.11-1.52-.91-.64.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.9-1.33 2.74-1.05 2.74-1.05.56 1.41.21 2.45.1 2.71.65.72 1.03 1.63 1.03 2.75 0 3.93-2.35 4.79-4.58 5.05.36.32.68.94.68 1.9v2.82c0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.2C22 6.58 17.52 2 12 2z" /></svg>
);
export const icLinkedin = (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.94 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM3.2 8.75h3.5V21H3.2zM9.5 8.75h3.35v1.68h.05c.47-.87 1.6-1.79 3.3-1.79 3.53 0 4.18 2.28 4.18 5.24V21h-3.5v-5.62c0-1.34-.03-3.06-1.87-3.06-1.87 0-2.16 1.45-2.16 2.96V21H9.5z" /></svg>
);
export const SECTION_ICONS: Record<string, JSX.Element> = {
  top: icHome,
  about: icUser,
  highlights: icStar,
  work: icBriefcase,
  stack: icTerminal,
  achievements: icAward,
  projects: icGrid,
  certs: icRibbon,
  contact: icMail,
};
