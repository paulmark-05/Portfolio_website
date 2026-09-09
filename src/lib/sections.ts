import type { SectionKey } from "./types";

/** Nav-link label for each configurable section — section `key` doubles
 *  as its `id` in the DOM, so this is the only mapping needed. */
export const SECTION_LABELS: Record<SectionKey, string> = {
  work: "Experience",
  stack: "Skills",
  achievements: "Achievements",
  projects: "Projects",
  certs: "Certificates",
};
