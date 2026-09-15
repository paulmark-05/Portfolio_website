import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabaseClient";
import { useToast } from "../../context/ToastContext";
import { SECTION_LABELS } from "../../lib/sections";
import { SEED } from "../../lib/content";
import type { SectionConfig, SectionKey } from "../../lib/types";

const ALL_KEYS: SectionKey[] = ["highlights", "work", "stack", "achievements", "projects", "certs"];

function normalize(raw: unknown): SectionConfig[] {
  if (!Array.isArray(raw) || !raw.length) return SEED.settings.sections;
  const out: SectionConfig[] = [];
  const seen = new Set<string>();
  for (const r of raw as any[]) {
    if (r && ALL_KEYS.includes(r.key) && !seen.has(r.key)) { out.push({ key: r.key, visible: !!r.visible }); seen.add(r.key); }
  }
  for (const k of ALL_KEYS) if (!seen.has(k)) out.push({ key: k, visible: true });
  return out;
}

export default function SectionsAdmin() {
  const qc = useQueryClient();
  const { run } = useToast();
  const [sections, setSections] = useState<SectionConfig[] | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase!.from("settings").select("sections").eq("id", 1).maybeSingle().then(({ data }) => {
      setSections(normalize(data?.sections ?? SEED.settings.sections));
    });
  }, []);

  const move = (i: number, dir: -1 | 1) => {
    if (!sections) return;
    const j = i + dir;
    if (j < 0 || j >= sections.length) return;
    const next = [...sections];
    [next[i], next[j]] = [next[j], next[i]];
    setSections(next);
  };
  const toggle = (i: number) => {
    if (!sections) return;
    const next = [...sections];
    next[i] = { ...next[i], visible: !next[i].visible };
    setSections(next);
  };

  const save = async () => {
    if (!sections) return;
    setBusy(true);
    await run(async () => {
      const { error } = await supabase!.from("settings").upsert({ id: 1, sections });
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["site-content"] });
    }, { loading: "Saving section order…", success: "Section order updated", error: "Failed to save — does the settings.sections column exist yet?" });
    setBusy(false);
  };

  if (!sections) return <div className="admin-empty">Loading…</div>;

  return (
    <div>
      <div className="admin-toolbar">
        <h1 className="admin-h1">Page sections</h1>
        <button className="btn btn-primary" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save"}</button>
      </div>
      <p className="admin-hint" style={{ marginBottom: 20 }}>
        Reorder or hide sections — the page and the nav menu both follow this exact order.
        About and Contact are structural and always shown, so they're pinned at the top and bottom.
      </p>

      <div className="section-order">
        <div className="section-order-row pinned"><span>About</span><span className="admin-hint">Always shown</span></div>

        {sections.map((s, i) => (
          <div className={`section-order-row${s.visible ? "" : " is-hidden"}`} key={s.key}>
            <div className="section-order-updown">
              <button className="btn btn-ghost" style={{ padding: "4px 9px" }} onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
              <button className="btn btn-ghost" style={{ padding: "4px 9px" }} onClick={() => move(i, 1)} disabled={i === sections.length - 1} aria-label="Move down">↓</button>
            </div>
            <span className="section-order-label">{SECTION_LABELS[s.key]}</span>
            <label className="admin-check">
              <input type="checkbox" checked={s.visible} onChange={() => toggle(i)} />
              <span>{s.visible ? "Visible" : "Hidden"}</span>
            </label>
          </div>
        ))}

        <div className="section-order-row pinned"><span>Contact</span><span className="admin-hint">Always shown</span></div>
      </div>
    </div>
  );
}
