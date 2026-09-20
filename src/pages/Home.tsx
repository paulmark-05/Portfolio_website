import { useContent } from "../hooks/useContent";
import { useRealtimeSync } from "../hooks/useRealtimeSync";
import Seo from "../components/layout/Seo";
import PremiumShell from "../components/premium/PremiumShell";
import PremiumSideNav from "../components/premium/PremiumSideNav";
import PremiumFooter from "../components/premium/PremiumFooter";
import ScrollFade from "../components/premium/ScrollFade";
import AboutSection from "../components/premium/AboutSection";
import HighlightsSection from "../components/premium/HighlightsSection";
import ExperienceSection from "../components/premium/ExperienceSection";
import StackSection from "../components/premium/StackSection";
import AchievementsSection from "../components/premium/AchievementsSection";
import ProjectsSection from "../components/premium/ProjectsSection";
import CertsSection from "../components/premium/CertsSection";
import ContactSection from "../components/premium/ContactSection";
import type { SiteContent, SectionKey } from "../lib/types";

function renderSection(key: SectionKey, content: SiteContent, index: string) {
  switch (key) {
    case "highlights": return <ScrollFade key={key}><HighlightsSection highlights={content.profile.highlights} index={index} /></ScrollFade>;
    case "work": return <ScrollFade key={key}><ExperienceSection experience={content.experience} projects={content.projects} index={index} /></ScrollFade>;
    case "stack": return <ScrollFade key={key}><StackSection skills={content.skills} settings={content.settings} index={index} /></ScrollFade>;
    case "achievements": return <ScrollFade key={key}><AchievementsSection achievements={content.achievements} index={index} /></ScrollFade>;
    case "projects": return <ScrollFade key={key}><ProjectsSection projects={content.projects} index={index} /></ScrollFade>;
    case "certs": return <ScrollFade key={key}><CertsSection certs={content.certifications} index={index} /></ScrollFade>;
  }
}

/** About is always 01 and Contact is always last — the middle sections
 *  number themselves off the admin-configured order/visibility, so hiding
 *  or reordering a section from /admin never leaves a gap or a repeat. */
function numbered(n: number): string {
  return String(n).padStart(2, "0");
}

export default function Home() {
  const { content } = useContent();
  // Live CMS → portfolio updates over Supabase Realtime (no refresh needed).
  useRealtimeSync();

  const orderedSections = content.settings.sections.filter((s) => s.visible);
  const contactIndex = numbered(orderedSections.length + 2);

  return (
    <PremiumShell>
      <Seo settings={content.settings} />
      <PremiumSideNav profile={content.profile} settings={content.settings} />
      <div className="lg:pl-[300px] xl:pl-[340px]">
        <ScrollFade><AboutSection profile={content.profile} index={numbered(1)} /></ScrollFade>
        {orderedSections.map((s, i) => renderSection(s.key, content, numbered(i + 2)))}
        <ScrollFade><ContactSection settings={content.settings} index={contactIndex} /></ScrollFade>
        <PremiumFooter />
      </div>
    </PremiumShell>
  );
}
