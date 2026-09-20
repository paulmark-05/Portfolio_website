import { resolveTech, techLogoUrl } from "../../lib/techRegistry";

/** A small circular logo chip for a tech-stack tag — used in Experience and
 *  Projects so the stack reads as a row of recognizable marks instead of
 *  text pills; the name only appears in a tooltip on hover. */
export default function TechBubble({ name, size = 34 }: { name: string; size?: number }) {
  const tech = resolveTech(name);
  const logo = techLogoUrl(tech);

  return (
    <div
      className="pr-btn-hover group relative flex shrink-0 items-center justify-center rounded-full border border-edge/12 bg-surface/35 backdrop-blur-md"
      style={{ height: size, width: size }}
    >
      {logo ? (
        <img
          src={logo}
          alt={tech.name}
          width={Math.round(size * 0.48)}
          height={Math.round(size * 0.48)}
          loading="lazy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      ) : (
        <span style={{ color: tech.color }} className="text-[9px] font-semibold">{tech.short.slice(0, 4)}</span>
      )}
      <span className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-edge/15 bg-surface/85 px-2.5 py-1 font-mono text-[11px] text-bone opacity-0 backdrop-blur-xl transition-opacity duration-150 group-hover:opacity-100">
        {tech.name}
      </span>
    </div>
  );
}
