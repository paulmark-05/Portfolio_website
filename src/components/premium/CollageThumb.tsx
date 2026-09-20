/** Fixed-space thumbnail for a project/highlight's photo(s):
 *  - 1 photo → plain full-cover image.
 *  - 2–4 photos → an automatic collage (2 side by side, 3 as one big +
 *    two stacked, 4 as a 2×2 grid) filling the same fixed box.
 *  - 5+ photos → the same 2×2 grid, with the 4th tile dimmed under a
 *    "+N" count for the rest.
 *  A translucent tint (the site's own --pr-bg void color) sits over the
 *  whole thing at rest and fades away on hover, so thumbnails read as part
 *  of the dark theme instead of raw photos breaking the palette — the
 *  color only shows through once you're actually interested. Assumes an
 *  ancestor has `group` on it (site's existing hover-zoom convention). */
export default function CollageThumb({ images, alt = "", onFirstError }: { images: string[]; alt?: string; onFirstError?: () => void }) {
  const shown = images.slice(0, 4);
  const extra = images.length - shown.length;
  const cols = shown.length >= 3 ? "grid-cols-2 grid-rows-2" : shown.length === 2 ? "grid-cols-2" : "grid-cols-1";

  return (
    <div className="relative h-full w-full">
      <div className={`grid h-full w-full gap-[3px] transition-transform duration-500 group-hover:scale-105 ${cols}`}>
        {shown.map((src, i) => (
          <div key={i} className={`relative overflow-hidden ${shown.length === 3 && i === 0 ? "row-span-2" : ""}`}>
            <img src={src} alt={alt} loading="lazy" onError={i === 0 ? onFirstError : undefined} className="h-full w-full object-cover" />
            {i === 3 && extra > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-void/70 font-mono text-sm text-bone">
                +{extra}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-void/55 transition-opacity duration-500 group-hover:opacity-0" />
    </div>
  );
}
