import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useContent } from "../hooks/useContent";
import PremiumShell from "../components/premium/PremiumShell";
import PremiumFooter from "../components/premium/PremiumFooter";
import PremiumProjectRow from "../components/premium/PremiumProjectRow";

/** Full project archive at /projects. Reuses PremiumProjectRow — the same
 *  card as the homepage — so both stay visually identical. "Back" restores
 *  the previous scroll position on the homepage. Arriving with a
 *  `#project-<id>` hash (e.g. from an Experience card's "View project"
 *  link) scrolls straight to that card instead of resetting to the top. */
export default function ProjectArchive() {
  const { content } = useContent();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    }
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goBack = () => {
    const y = Number(sessionStorage.getItem("portfolioScroll") || "0");
    navigate("/");
    requestAnimationFrame(() => setTimeout(() => window.scrollTo(0, y), 60));
  };

  const all = [...content.projects].sort((a, b) => Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder);

  return (
    <PremiumShell>
      <section className="mx-auto max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
        <button onClick={goBack} className="mb-10 inline-flex items-center gap-2 font-mono text-xs text-mist transition-colors hover:text-bone">
          ← Back to Portfolio
        </button>
        <h1 className="font-display text-4xl font-light text-bone sm:text-6xl">Project <em className="italic text-mist">archive</em></h1>
        <p className="mt-4 text-sm text-mist">All projects — {all.length} total.</p>

        <div className="mt-14">
          {all.map((p, i) => <PremiumProjectRow key={p.id} p={p} index={i} />)}
        </div>
      </section>
      <PremiumFooter />
    </PremiumShell>
  );
}
