import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabaseClient";
import { FormDrawer, Field } from "../components/FormDrawer";
import TechAutocomplete from "../components/TechAutocomplete";
import ImageUploader from "../components/ImageUploader";
import { mediaUrl } from "../../lib/queries";
import { resolveTech, techLogoUrl, type Tech } from "../../lib/techRegistry";
import { useToast } from "../../context/ToastContext";

interface Row { id: string; category: string; name: string; full_name: string; color: string; logo: string; sort_order: number; }

/** Logo for a skill: uploaded custom logo wins, else registry/CDN logo. */
function rowLogo(r: { logo?: string; full_name?: string; name?: string }): string {
  if (r.logo) return mediaUrl(r.logo);
  return techLogoUrl(resolveTech(r.full_name || r.name || ""));
}

export default function SkillsAdmin() {
  const qc = useQueryClient();
  const { run: runToast } = useToast();
  const { data: rows = [] } = useQuery({ queryKey: ["admin", "skills"], queryFn: async () => {
    const { data, error } = await supabase!.from("skills").select("*").order("sort_order"); if (error) throw error;
    return (data as any[]).map((r) => ({ logo: "", color: "#5A7A5B", full_name: r.name, ...r })) as Row[];
  }});

  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ full_name: "", logo: "", color: "#5A7A5B", short: "" });
  const [busy, setBusy] = useState(false);
  const [confirmRow, setConfirmRow] = useState<Row | null>(null);

  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin", "skills"] }); qc.invalidateQueries({ queryKey: ["site-content"] }); };

  const pick = (t: Tech) => setDraft({ full_name: t.name, short: t.short, color: t.color, logo: "" });

  const create = async () => {
    if (!draft.full_name.trim()) return;
    setBusy(true);
    await runToast(async () => {
      const t = resolveTech(draft.full_name);
      const full: any = {
        category: "stack",
        name: draft.short || t.short || draft.full_name.slice(0, 6),
        full_name: draft.full_name,
        color: draft.color || t.color,
        logo: draft.logo || null,
        sort_order: rows.length,
      };
      const exec = (p: any) => supabase!.from("skills").insert(p);
      let { error } = await exec(full);
      if (error && /column .*logo/i.test(error.message)) { const { logo, ...safe } = full; ({ error } = await exec(safe)); }
      if (error) throw error;
      setCreating(false); setDraft({ full_name: "", logo: "", color: "#5A7A5B", short: "" }); refresh();
    }, { loading: "Adding skill…", success: "Skill added", error: "Failed to add skill" });
    setBusy(false);
  };

  const doDelete = async (r: Row) => {
    await runToast(async () => { const { error } = await supabase!.from("skills").delete().eq("id", r.id); if (error) throw error; setConfirmRow(null); refresh(); },
      { loading: "Deleting…", success: "Skill deleted", error: "Failed to delete skill" });
  };

  return (
    <div>
      <div className="admin-toolbar">
        <h1 className="admin-h1">Skills</h1>
        <button className="btn btn-primary" onClick={() => setCreating(true)}>+ New</button>
      </div>
      <p style={{ color: "var(--muted)", margin: "0 0 20px", fontSize: 14 }}>
        Each skill is just a technology — logo + name. Add one with a single search; delete with the ✕ on its card.
      </p>

      <div className="skill-kpis">
        {rows.map((r) => {
          const logo = rowLogo(r);
          return (
            <div className="skill-kpi" key={r.id}>
              <button className="skill-x" aria-label={`Delete ${r.full_name || r.name}`} onClick={() => setConfirmRow(r)}>✕</button>
              <div className="skill-kpi-logo">
                {logo
                  ? <img src={logo} alt="" width={30} height={30} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                  : <span className="skill-kpi-fallback">{(r.name || r.full_name || "?").slice(0, 2)}</span>}
              </div>
              <div className="skill-kpi-name">{r.full_name || r.name}</div>
            </div>
          );
        })}
        {!rows.length && <div className="admin-empty">No skills yet — add your first technology.</div>}
      </div>

      {/* Create drawer — single Technology field (+ optional custom logo) */}
      <FormDrawer open={creating} busy={busy} title="New skill" onClose={() => setCreating(false)} onSave={create}>
        <Field label="Technology (type to search — or enter a custom one)">
          <TechAutocomplete
            single allowCustom
            value={draft.full_name ? [draft.full_name] : []}
            onChange={(vals) => setDraft({ ...draft, full_name: vals[0] || "" })}
            onPickSingle={pick}
            placeholder="e.g. React, CrewAI, Pinecone, n8n, LlamaIndex…"
          />
        </Field>
        {draft.full_name && !techLogoUrl(resolveTech(draft.full_name)) && (
          <Field label="Custom logo (this technology has no built-in logo)">
            <ImageUploader value={draft.logo} onChange={(p) => setDraft({ ...draft, logo: p })} label="logo" />
          </Field>
        )}
        {draft.full_name && (
          <div className="tech-preview">
            {(draft.logo ? mediaUrl(draft.logo) : techLogoUrl(resolveTech(draft.full_name)))
              ? <img src={draft.logo ? mediaUrl(draft.logo) : techLogoUrl(resolveTech(draft.full_name))} alt="" width={24} height={24} />
              : <span className="tech-preview-sw" style={{ background: draft.color }} />}
            <span><b>{draft.full_name}</b></span>
          </div>
        )}
      </FormDrawer>

      {/* Delete confirmation toast */}
      {confirmRow && (
        <div className="skill-confirm" role="dialog" aria-modal="true">
          <div className="skill-confirm-card">
            <p>Delete <b>{confirmRow.full_name || confirmRow.name}</b>?</p>
            <div className="skill-confirm-actions">
              <button className="btn btn-ghost" onClick={() => setConfirmRow(null)}>Cancel</button>
              <button className="btn btn-ghost danger" onClick={() => doDelete(confirmRow)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
