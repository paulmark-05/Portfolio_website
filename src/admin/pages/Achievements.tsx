import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabaseClient";
import { DataTable } from "../components/DataTable";
import { FormDrawer, Field, FieldBlock } from "../components/FormDrawer";
import RichTextEditor from "../components/RichTextEditor";
import ImageUploader from "../components/ImageUploader";
import { mediaUrl } from "../../lib/queries";
import { useToast } from "../../context/ToastContext";

interface Row {
  id: string; title: string; description: string; icon: string; category: string;
  organization: string; year: string; link: string; image: string;
  highlight: boolean; visible: boolean; sort_order: number;
}
const empty: Row = {
  id: "", title: "", description: "", icon: "", category: "",
  organization: "", year: "", link: "", image: "", highlight: false, visible: true, sort_order: 0,
};

// columns that may not exist before the migration — stripped on retry
const OPTIONAL = ["organization", "year", "link", "visible", "image"];

export default function AchievementsAdmin() {
  const qc = useQueryClient();
  const { run } = useToast();
  const { data: rows = [] } = useQuery({ queryKey: ["admin", "achievements"], queryFn: async () => {
    const { data, error } = await supabase!.from("achievements").select("*").order("sort_order"); if (error) throw error;
    return (data as any[]).map((r) => ({ organization: "", year: "", link: "", image: "", visible: true, ...r })) as Row[];
  }});
  const [draft, setDraft] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin", "achievements"] }); qc.invalidateQueries({ queryKey: ["site-content"] }); };

  const save = async () => {
    if (!draft) return; setBusy(true);
    await run(async () => {
      const p = { ...draft } as any; if (!p.id) delete p.id;
      const exec = (payload: any) => draft.id
        ? supabase!.from("achievements").update(payload).eq("id", draft.id)
        : supabase!.from("achievements").insert(payload);
      let { error } = await exec(p);
      if (error && OPTIONAL.some((c) => new RegExp(`column .*${c}`, "i").test(error!.message))) {
        const safe = { ...p }; OPTIONAL.forEach((c) => delete safe[c]);
        ({ error } = await exec(safe));
      }
      if (error) throw error;
      setDraft(null); refresh();
    }, { loading: draft.id ? "Saving…" : "Adding…", success: draft.id ? "Achievement updated" : "Achievement added", error: "Failed to save achievement" });
    setBusy(false);
  };

  const remove = async (r: Row) => {
    await run(async () => { const { error } = await supabase!.from("achievements").delete().eq("id", r.id); if (error) throw error; refresh(); },
      { loading: "Deleting…", success: "Achievement deleted", error: "Failed to delete" });
  };

  const move = async (r: Row, dir: -1 | 1) => {
    const sorted = [...rows].sort((a, b) => a.sort_order - b.sort_order);
    const i = sorted.findIndex((x) => x.id === r.id);
    const j = i + dir;
    if (j < 0 || j >= sorted.length) return;
    const a = sorted[i], b = sorted[j];
    await Promise.all([
      supabase!.from("achievements").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase!.from("achievements").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    refresh();
  };

  return (<>
    <DataTable<Row> title="Achievements" rows={rows}
      columns={[
        { key: "title", label: "Title", render: (r) => <span><b>{r.icon} {r.title}</b>{r.highlight ? <span className="featbadge" style={{ marginLeft: 8 }}>Highlight</span> : null}{r.visible === false ? <span className="featbadge" style={{ marginLeft: 8, opacity: .6 }}>Hidden</span> : null}</span> },
        { key: "meta", label: "Org · Year", render: (r) => [r.organization, r.year].filter(Boolean).join(" · ") || "—" },
        { key: "order", label: "Order", render: (r) => (
            <span style={{ display: "inline-flex", gap: 4 }}>
              <button className="btn btn-ghost" style={{ padding: "2px 8px" }} onClick={(e) => { e.stopPropagation(); move(r, -1); }}>↑</button>
              <button className="btn btn-ghost" style={{ padding: "2px 8px" }} onClick={(e) => { e.stopPropagation(); move(r, 1); }}>↓</button>
            </span>
          ) },
      ]}
      onNew={() => setDraft({ ...empty, sort_order: rows.length })} onEdit={(r) => setDraft(r)} onDelete={remove} />

    <FormDrawer open={!!draft} busy={busy} title={draft?.id ? "Edit achievement" : "New achievement"} onClose={() => setDraft(null)} onSave={save}>
      {draft && (<>
        <Field label="Title"><input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Letter of Commendation" /></Field>
        <FieldBlock label="Description"><RichTextEditor value={draft.description} onChange={(description) => setDraft({ ...draft, description })} /></FieldBlock>
        <div className="admin-2col">
          <Field label="Organization"><input value={draft.organization} onChange={(e) => setDraft({ ...draft, organization: e.target.value })} placeholder="Rajya Sainik Board" /></Field>
          <Field label="Year"><input value={draft.year} onChange={(e) => setDraft({ ...draft, year: e.target.value })} placeholder="2025" /></Field>
        </div>
        <div className="admin-2col">
          <Field label="Icon (emoji or symbol)"><input value={draft.icon} onChange={(e) => setDraft({ ...draft, icon: e.target.value })} placeholder="★" /></Field>
          <Field label="Category"><input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} placeholder="Award" /></Field>
        </div>
        <Field label="Link (optional)"><input value={draft.link} onChange={(e) => setDraft({ ...draft, link: e.target.value })} placeholder="https://…" /></Field>
        <Field label="Proof photo (optional — a cheque, certificate, thank-you note…)">
          <ImageUploader value={draft.image} onChange={(image) => setDraft({ ...draft, image })} label="achievement photo" />
        </Field>
        <div className="admin-2col">
          <Field label="Highlight"><label className="admin-check"><input type="checkbox" checked={draft.highlight} onChange={(e) => setDraft({ ...draft, highlight: e.target.checked })} /><span>Featured lead card</span></label></Field>
          <Field label="Visible"><label className="admin-check"><input type="checkbox" checked={draft.visible} onChange={(e) => setDraft({ ...draft, visible: e.target.checked })} /><span>Show on site</span></label></Field>
        </div>

        <div className="ach-preview-wrap">
          <span className="admin-hint">Preview</span>
          <article className={`ach-card${draft.highlight ? " ach-lead" : ""}`} style={{ marginTop: 8 }}>
            <div className="ach-top">
              <span className="ach-icon">{draft.icon || "◆"}</span>
              {draft.category && <span className="ach-cat">{draft.category}</span>}
            </div>
            <h4>{draft.title || "Achievement title"}</h4>
            <p dangerouslySetInnerHTML={{ __html: draft.description || "Short description of the achievement." }} />
            {draft.image && <img src={mediaUrl(draft.image)} alt="" className="ach-thumb-preview" />}
          </article>
        </div>
      </>)}
    </FormDrawer>
  </>);
}
