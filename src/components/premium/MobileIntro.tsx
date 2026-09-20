import { motion } from "framer-motion";
import type { Profile } from "../../lib/types";

/** Mobile/tablet only (lg:hidden) — the name + tagline "intro" moment
 *  that desktop shows permanently in the sidebar. On these widths the
 *  sidebar collapses to a compact top bar instead, so this sits as real
 *  scrollable content right above About, the same place a hero used to
 *  live before it was folded into the sidebar. */
export default function MobileIntro({ profile }: { profile: Profile }) {
  return (
    <section className="px-6 pb-10 pt-20 lg:hidden">
      {profile.availabilityBadge && (
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-edge/15 bg-surface/25 px-3.5 py-1.5 text-xs text-silver backdrop-blur-md"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          {profile.availabilityBadge}
        </motion.span>
      )}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="font-display text-[13vw] font-light leading-[0.98] tracking-tightest text-bone sm:text-6xl"
      >
        {profile.name}
      </motion.h1>
      {profile.title && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 font-display text-2xl font-light leading-snug text-silver sm:text-3xl"
        >
          {profile.title}
        </motion.p>
      )}
    </section>
  );
}
