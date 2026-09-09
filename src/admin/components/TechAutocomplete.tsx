import { useMemo, useRef, useState } from "react";
import { searchTechs, resolveTech, techLogoUrl, type Tech } from "../../lib/techRegistry";

/**
 * Tech autocomplete. Two modes:
 *  - multi (default): chip multi-select for a project's stack (no manual typing
 *    of comma lists). `value` is string[].
 *  - single: pick exactly one technology (Skills CMS). Calls onPickSingle with
 *    the full Tech so the caller can auto-fill logo/color/metadata.
 */
export default function TechAutocomplete({
  value,
  onChange,
  single = false,
  allowCustom = false,
  onPickSingle,
  placeholder = "Type a technology… e.g. React",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  single?: boolean;
  allowCustom?: boolean;
  onPickSingle?: (t: Tech) => void;
  placeholder?: string;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const picked = new Set(value.map((v) => v.toLowerCase()));
    return searchTechs(q).filter((t) => single || !picked.has(t.name.toLowerCase()));
  }, [q, value, single]);

  const pick = (t: Tech) => {
    if (single) {
      onChange([t.name]);
      onPickSingle?.(t);
      setQ(t.name);
      setOpen(false);
      return;
    }
    if (!value.some((v) => v.toLowerCase() === t.name.toLowerCase())) {
      onChange([...value, t.name]);
    }
    setQ("");
    setOpen(true);
    setHi(0);
  };

  const remove = (name: string) =>
    onChange(value.filter((v) => v.toLowerCase() !== name.toLowerCase()));

  // Commit a free-typed value that isn't in the registry (custom technology).
  const pickCustom = () => {
    const name = q.trim();
    if (!name) return;
    if (single) { onChange([name]); setQ(name); setOpen(false); return; }
    if (!value.some((v) => v.toLowerCase() === name.toLowerCase())) onChange([...value, name]);
    setQ(""); setOpen(true); setHi(0);
  };
  const exactExists = suggestions.some((t) => t.name.toLowerCase() === q.trim().toLowerCase());
  const showCustom = allowCustom && q.trim().length > 0 && !exactExists;

  return (
    <div className="tech-ac" ref={boxRef}>
      {!single && value.length > 0 && (
        <div className="tech-ac-chips">
          {value.map((v) => {
            const t = resolveTech(v);
            const logo = techLogoUrl(t);
            return (
              <span className="tech-chip" key={v} style={{ borderColor: t.color }}>
                {logo && <img src={logo} alt="" width={14} height={14} />}
                {v}
                <button type="button" aria-label={`Remove ${v}`} onClick={() => remove(v)}>✕</button>
              </span>
            );
          })}
        </div>
      )}

      <input
        value={q}
        placeholder={placeholder}
        onChange={(e) => { setQ(e.target.value); setOpen(true); setHi(0); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 140)}
        onKeyDown={(e) => {
          if (!open) return;
          if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, suggestions.length - 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
          else if (e.key === "Enter") {
            e.preventDefault();
            if (suggestions[hi]) pick(suggestions[hi]);
            else if (showCustom) pickCustom();
          }
          else if (e.key === "Escape") setOpen(false);
        }}
      />

      {open && (suggestions.length > 0 || showCustom) && (
        <ul className="tech-ac-list" role="listbox">
          {suggestions.map((t, i) => {
            const logo = techLogoUrl(t);
            return (
              <li
                key={t.name}
                role="option"
                aria-selected={i === hi}
                className={i === hi ? "hi" : ""}
                onMouseEnter={() => setHi(i)}
                onMouseDown={(e) => { e.preventDefault(); pick(t); }}
              >
                <span className="tech-ac-logo" style={{ background: logo ? "transparent" : t.color }}>
                  {logo ? <img src={logo} alt="" width={16} height={16} /> : t.short.slice(0, 2)}
                </span>
                <span className="tech-ac-name">{t.name}</span>
                <span className="tech-ac-hex" style={{ color: t.color }}>{t.color}</span>
              </li>
            );
          })}
          {showCustom && (
            <li role="option" className="tech-ac-custom"
              onMouseDown={(e) => { e.preventDefault(); pickCustom(); }}>
              <span className="tech-ac-logo" style={{ background: "var(--accent)" }}>+</span>
              <span className="tech-ac-name">Add “{q.trim()}” as a custom technology</span>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
