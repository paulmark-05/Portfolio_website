export interface CTA { label: string; href: string }
export interface QuickFact { label: string; value: string }

export interface InfoCard { icon: string; text: string; visible: boolean }
export interface Highlight { headline: string; text: string; images: string[] }   // text is HTML-allowed; up to 3 photos

export interface Profile {
  name: string;
  title: string;
  subtitle: string;
  availabilityBadge: string;   // editable hero "Open to…" badge
  aboutTitle: string;          // editable About section heading
  roles: string[];             // legacy — only the pre-redesign preview still reads this
  roleSummary: string;         // one-line "what I do" sentence shown in the sidebar/mobile intro
  ctaPrimary: CTA;
  ctaGhost: CTA;
  resumeUrl: string;
  aboutParagraphs: string[];   // HTML-allowed (bold tags etc.)
  quickFacts: QuickFact[];
  infoCards: InfoCard[];       // editable hero info row (emoji + text)
  highlights: Highlight[];     // editable highlight cards (admin-chosen icon + text)
  aboutImage: string;
  heroImage: string;
  stackImage: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;         // HTML-allowed (<span class="m"> metrics)
  dateLabel: string;
  featured: boolean;
  active: boolean;             // currently-active project (drives counters + badge)
  techStack: string[];
  githubUrl: string;
  liveUrl: string;
  demoUrl: string;              // walkthrough video showing the features in action
  image: string;                // legacy single cover — superseded by images[], kept as its [0] fallback
  images: string[];             // preview photos; collage thumbnail + gallery when there's more than one
  sortOrder: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;                // optional emoji/short label
  category: string;
  organization: string;
  year: string;
  link: string;
  image: string;                // optional proof photo (uploaded via admin)
  highlight: boolean;
  visible: boolean;
  sortOrder: number;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  duration: string;
  stepLabel: string;
  description: string;
  tags: string[];
  logo: string;        // optional uploaded company logo; falls back to initials badge
  sortOrder: number;
  linkedProjectId?: string;  // optional — links to a Project, scrolls there on click
}

export interface Skill {
  id: string;
  category: string;
  name: string;       // bubble short label
  fullName: string;
  color: string;      // hex accent
  logo: string;       // uploaded custom logo path/url (optional)
  sortOrder: number;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  dateLabel: string;
  description: string;
  image: string;
  sortOrder: number;
}

/** The reorderable/hideable middle sections — About and Contact are
 *  structural (always shown) so they're not part of this list. */
export type SectionKey = "highlights" | "work" | "stack" | "achievements" | "projects" | "certs";
export interface SectionConfig { key: SectionKey; visible: boolean }

export interface Settings {
  email: string;
  linkedin: string;
  github: string;
  contactImage: string;
  contactEyebrow: string;
  contactHeading: string;    // HTML-allowed (em tags)
  contactDescription: string;
  stackTitle: string;          // HTML-allowed
  stackQuote: string;
  stackDescription: string;
  seoTitle: string;
  seoDesc: string;
  seoKeywords: string[];
  sections: SectionConfig[];   // display order + visibility, drives both the page and the nav menu
}

export interface SiteContent {
  profile: Profile;
  projects: Project[];
  experience: Experience[];
  achievements: Achievement[];
  skills: Skill[];
  certifications: Certification[];
  settings: Settings;
}
