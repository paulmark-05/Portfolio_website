import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSmoothScroll, scrollToHash } from "../../lib/smoothScroll";
import type { Profile } from "../../lib/types";

function RoleCycle({ roles }: { roles: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (roles.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % roles.length), 2800);
    return () => clearInterval(t);
  }, [roles]);
  if (!roles.length) return null;
  return (
    <div className="h-7 overflow-hidden font-mono text-sm tracking-wide text-mist sm:text-base">
      <motion.div key={i} initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
        {roles[i]}
      </motion.div>
    </div>
  );
}

export default function Hero({ profile }: { profile: Profile }) {
  const { lenisRef } = useSmoothScroll();
  const roles = (profile.roles || []).filter(Boolean);

  return (
    <section id="top" className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-6 pt-24 sm:px-10 lg:pt-0">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[70vw] w-[70vw] max-h-[620px] max-w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[90px]"
        style={{ background: "radial-gradient(circle, rgb(var(--pr-accent) / 0.4), transparent 72%)" }}
      />
      <div className="relative w-full max-w-6xl">
        {profile.availabilityBadge && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-edge/15 bg-surface/25 px-4 py-1.5 text-xs text-silver backdrop-blur-md"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            {profile.availabilityBadge}
          </motion.div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-[13vw] font-light leading-[0.95] tracking-tightest text-bone sm:text-[8vw] lg:text-[6.4vw]"
        >
          {profile.name}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 max-w-2xl font-display text-xl font-light text-silver sm:text-2xl"
        >
          {profile.title}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.6 }}
          className="mt-5"
        >
          <RoleCycle roles={roles} />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 max-w-xl text-base leading-relaxed text-mist sm:text-lg"
          dangerouslySetInnerHTML={{ __html: profile.subtitle }}
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          {profile.ctaPrimary?.label && (
            <a
              href={profile.ctaPrimary.href}
              onClick={(e) => {
                if (profile.ctaPrimary.href.startsWith("#")) {
                  e.preventDefault();
                  scrollToHash(lenisRef, profile.ctaPrimary.href);
                }
              }}
              className="pr-btn-hover rounded-full bg-bone px-6 py-3 text-sm font-medium text-void shadow-[0_8px_30px_-10px_rgb(var(--pr-accent)/0.5)]"
            >
              {profile.ctaPrimary.label}
            </a>
          )}
          {profile.ctaGhost?.label && (
            <a
              href={profile.ctaGhost.href}
              onClick={(e) => {
                if (profile.ctaGhost.href.startsWith("#")) {
                  e.preventDefault();
                  scrollToHash(lenisRef, profile.ctaGhost.href);
                }
              }}
              className="pr-btn-hover rounded-full border border-edge/20 bg-surface/25 px-6 py-3 text-sm font-medium text-bone backdrop-blur-md hover:border-edge/40 hover:bg-surface/40"
            >
              {profile.ctaGhost.label}
            </a>
          )}
        </motion.div>
      </div>
    </section>
  );
}
