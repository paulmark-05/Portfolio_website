import { supabase, supabaseEnabled } from "./supabaseClient";
import { SEED } from "./content";
import type {
  SiteContent, Project, Experience, Skill, Certification, Profile, Settings, Achievement, SectionConfig, SectionKey,
} from "./types";

const SECTION_KEYS: SectionKey[] = ["work", "stack", "achievements", "projects", "certs"];

/** Merge whatever is stored for section order/visibility with the known
 *  section keys. If nothing is stored at all yet (e.g. the `sections`
 *  column hasn't been added to the live DB), fall back to the curated
 *  SEED order rather than synthesizing an "everything visible" list —
 *  otherwise a section deliberately hidden in SEED (like Achievements)
 *  would reappear the moment Supabase is connected. */
function normalizeSections(raw: unknown): SectionConfig[] {
  if (!Array.isArray(raw) || !raw.length) return SEED.settings.sections;
  const out: SectionConfig[] = [];
  const seen = new Set<string>();
  for (const r of raw as any[]) {
    if (r && SECTION_KEYS.includes(r.key) && !seen.has(r.key)) {
      out.push({ key: r.key, visible: !!r.visible });
      seen.add(r.key);
    }
  }
  for (const k of SECTION_KEYS) if (!seen.has(k)) out.push({ key: k, visible: true });
  return out;
}

/** Map a Storage path or absolute URL to a public URL. */
export function mediaUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return "";
  if (/^https?:\/\//.test(pathOrUrl) || pathOrUrl.startsWith("/")) return pathOrUrl;
  if (!supabase) return pathOrUrl;
  return supabase.storage.from("media").getPublicUrl(pathOrUrl).data.publicUrl;
}

/** Fetch the full site content. Falls back to SEED if Supabase is off
 *  or a table is empty, so the public site always renders. */
export async function fetchSiteContent(): Promise<SiteContent> {
  if (!supabaseEnabled || !supabase) return SEED;
  try {
    const [profileR, projectsR, expR, skillsR, certsR, settingsR, achR] = await Promise.all([
      supabase.from("profiles").select("*").limit(1).maybeSingle(),
      supabase.from("projects").select("*").order("sort_order"),
      supabase.from("experience").select("*").order("sort_order"),
      supabase.from("skills").select("*").order("sort_order"),
      supabase.from("certifications").select("*").order("sort_order"),
      supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("achievements").select("*").order("sort_order"),
    ]);

    const profile: Profile = profileR.data
      ? {
          name: profileR.data.name ?? SEED.profile.name,
          title: profileR.data.title ?? SEED.profile.title,
          availabilityBadge: profileR.data.availability_badge ?? SEED.profile.availabilityBadge,
          subtitle: profileR.data.subtitle ?? SEED.profile.subtitle,
          roles: profileR.data.roles ?? SEED.profile.roles,
          ctaPrimary: profileR.data.cta_primary ?? SEED.profile.ctaPrimary,
          ctaGhost: profileR.data.cta_ghost ?? SEED.profile.ctaGhost,
          resumeUrl: profileR.data.resume_url ?? SEED.profile.resumeUrl,
          aboutParagraphs: (profileR.data.about_md ?? "")
            ? String(profileR.data.about_md).split("\n\n")
            : SEED.profile.aboutParagraphs,
          aboutTitle: profileR.data.about_title ?? SEED.profile.aboutTitle,
          quickFacts: profileR.data.quick_facts ?? SEED.profile.quickFacts,
          infoCards: profileR.data.info_cards ?? SEED.profile.infoCards,
          // migrate the old single `commendation` string into the new
          // multi-highlight list on read, so existing content still shows
          // up even before the `highlights` column/data exists.
          highlights: profileR.data.highlights ?? (
            profileR.data.commendation
              ? [{ icon: "🏅", text: profileR.data.commendation }]
              : SEED.profile.highlights
          ),
          aboutImage: mediaUrl(profileR.data.about_image ?? SEED.profile.aboutImage),
          heroImage: mediaUrl(profileR.data.hero_image ?? SEED.profile.heroImage),
          stackImage: mediaUrl(profileR.data.stack_image ?? SEED.profile.stackImage),
        }
      : SEED.profile;

    const projects: Project[] = projectsR.data?.length
      ? projectsR.data.map((r: any) => ({
          id: r.id, slug: r.slug, title: r.title, description: r.description ?? "",
          dateLabel: r.date_label ?? "", featured: !!r.featured, active: !!r.active,
          techStack: r.tech_stack ?? [], githubUrl: r.github_url ?? "",
          liveUrl: r.live_url ?? "", image: mediaUrl(r.image ?? ""), sortOrder: r.sort_order ?? 0,
        }))
      : SEED.projects;

    const experience: Experience[] = expR.data?.length
      ? expR.data.map((r: any) => ({
          id: r.id, company: r.company, role: r.role, duration: r.duration ?? "",
          stepLabel: r.step_label ?? (r.current ? "Currently shipping" : "Experience"),
          description: r.description ?? "",
          tags: r.tags ?? [], logo: mediaUrl(r.logo ?? ""), sortOrder: r.sort_order ?? 0,
        }))
      : SEED.experience;

    const skills: Skill[] = skillsR.data?.length
      ? skillsR.data.map((r: any) => ({
          id: r.id, category: r.category, name: r.name, fullName: r.full_name ?? r.name,
          color: r.color ?? "#5A7A5B", logo: mediaUrl(r.logo ?? ""), sortOrder: r.sort_order ?? 0,
        }))
      : SEED.skills;

    const certifications: Certification[] = certsR.data?.length
      ? certsR.data.map((r: any) => ({
          id: r.id, title: r.title, issuer: r.issuer ?? "", dateLabel: r.date_label ?? "",
          description: r.description ?? "", image: mediaUrl(r.image ?? ""), sortOrder: r.sort_order ?? 0,
        }))
      : SEED.certifications;

    const achievements: Achievement[] = achR.data?.length
      ? achR.data.map((r: any) => ({
          id: r.id, title: r.title, description: r.description ?? "",
          icon: r.icon ?? "", category: r.category ?? "",
          organization: r.organization ?? "", year: r.year ?? "", link: r.link ?? "",
          image: mediaUrl(r.image ?? ""),
          highlight: !!r.highlight, visible: r.visible !== false,
          sortOrder: r.sort_order ?? 0,
        })).filter((a) => a.visible)
      : SEED.achievements;

    const settings: Settings = settingsR.data
      ? {
          email: settingsR.data.email ?? SEED.settings.email,
          linkedin: settingsR.data.linkedin ?? SEED.settings.linkedin,
          github: settingsR.data.github ?? SEED.settings.github,
          contactImage: mediaUrl(settingsR.data.contact_image ?? SEED.settings.contactImage),
          contactEyebrow: settingsR.data.contact_eyebrow ?? SEED.settings.contactEyebrow,
          contactHeading: settingsR.data.contact_heading ?? SEED.settings.contactHeading,
          contactDescription: settingsR.data.contact_description ?? SEED.settings.contactDescription,
          stackTitle: settingsR.data.stack_title ?? SEED.settings.stackTitle,
          stackQuote: settingsR.data.stack_quote ?? SEED.settings.stackQuote,
          stackDescription: settingsR.data.stack_description ?? SEED.settings.stackDescription,
          seoTitle: settingsR.data.seo_title ?? SEED.settings.seoTitle,
          seoDesc: settingsR.data.seo_desc ?? SEED.settings.seoDesc,
          seoKeywords: settingsR.data.seo_keywords ?? SEED.settings.seoKeywords,
          sections: normalizeSections(settingsR.data.sections),
        }
      : SEED.settings;

    return { profile, projects, experience, achievements, skills, certifications, settings };
  } catch (e) {
    console.warn("Supabase fetch failed, using seed content.", e);
    return SEED;
  }
}
