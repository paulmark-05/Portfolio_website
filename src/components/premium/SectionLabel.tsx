export default function SectionLabel({ index, children }: { index: string; children: string }) {
  return (
    <div className="mb-10 flex items-center gap-3 sm:mb-14">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      <span className="font-mono text-xs tracking-[0.25em] text-mist">{index}</span>
      <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-silver">{children}</h2>
    </div>
  );
}
