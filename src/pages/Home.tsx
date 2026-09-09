import { useEffect, useState } from "react";
import { useContent } from "../hooks/useContent";
import { useReveal } from "../hooks/useReveal";
import { useRealtimeSync } from "../hooks/useRealtimeSync";
import Nav from "../components/layout/Nav";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import Seo from "../components/layout/Seo";
import About from "../components/sections/About";
import Experience from "../components/sections/Experience";
import Achievements from "../components/sections/Achievements";
import Stack from "../components/sections/Stack";
import Projects from "../components/sections/Projects";
import Certs from "../components/sections/Certs";
import Contact from "../components/sections/Contact";
import type { SiteContent, SectionKey } from "../lib/types";

const SIDEBAR_KEY = "np-sidebar-open";

/** Renders the one middle section for a given key — the display order and
 *  visibility both come from `settings.sections`, kept in sync with the
 *  Nav's link list so the menu always matches the page. */
function renderSection(key: SectionKey, content: SiteContent) {
  switch (key) {
    case "work": return <Experience key={key} experience={content.experience} />;
    case "stack": return <Stack key={key} skills={content.skills} />;
    case "achievements": return <Achievements key={key} achievements={content.achievements} />;
    case "projects": return <Projects key={key} projects={content.projects} />;
    case "certs": return <Certs key={key} certs={content.certifications} />;
  }
}

export default function Home() {
  const { content } = useContent();
  // Live CMS → portfolio updates over Supabase Realtime (no refresh needed).
  useRealtimeSync();
  // re-run reveal observer whenever data-driven content changes
  useReveal([content.projects.length, content.certifications.length, content.settings.sections.length, content.experience.length]);

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_KEY) !== "0"; } catch { return true; }
  });
  useEffect(() => {
    try { localStorage.setItem(SIDEBAR_KEY, sidebarOpen ? "1" : "0"); } catch { /* ignore */ }
  }, [sidebarOpen]);

  const orderedSections = content.settings.sections.filter((s) => s.visible);

  return (
    <>
      <Seo settings={content.settings} />
      <Nav resumeUrl={content.profile.resumeUrl} sections={content.settings.sections} />
      <div id="top" />
      <div className={`layout${sidebarOpen ? "" : " sidebar-collapsed"}`}>
        <Sidebar profile={content.profile} settings={content.settings} open={sidebarOpen} onToggle={() => setSidebarOpen((o) => !o)} />
        <main className="layout-main">
          <About profile={content.profile} />
          {orderedSections.map((s) => renderSection(s.key, content))}
          <Contact settings={content.settings} />
        </main>
      </div>
      <Footer />
    </>
  );
}
