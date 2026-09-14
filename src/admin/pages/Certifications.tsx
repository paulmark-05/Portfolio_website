import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabaseClient";
import { DataTable } from "../components/DataTable";
import { FormDrawer, Field, FieldBlock } from "../components/FormDrawer";
import ImageUploader from "../components/ImageUploader";
import RichTextEditor from "../components/RichTextEditor";
import { useToast } from "../../context/ToastContext";

interface Row { id: string; title: string; issuer: string; date_label: string; description: string; image: string; sort_order: number; }
const empty: Row = { id: "", title: "", issuer: "", date_label: "", description: "", image: "", sort_order: 0 };

export default function CertificationsAdmin() {
  const qc = useQueryClient();
  const { run } = useToast();
  const { data: rows = [] } = useQuery({ queryKey: ["admin", "certifications"], queryFn: async () => {
    const { data, error } = await supabase!.from("certifications").select("*").order("sort_order"); if (error) throw error; return data as Row[];
  }});
  const [draft, setDraft] = useState<Row | null>(null); const [busy, setBusy] = useState(false);
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin", "certifications"] }); qc.invalidateQueries({ queryKey: ["site-content"] }); };
  const save = async () => { if (!draft) return; setBusy(true);
    await run(async () => { const p = { ...draft } as any; if (!p.id) delete p.id;
      const { error } = draft.id ? await supabase!.from("certifications").update(p).eq("id", draft.id) : await supabase!.from("certifications").insert(p);
      if (error) throw error; setDraft(null); refresh();
    }, { loading: draft.id ? "Saving…" : "Adding…", success: draft.id ? "Certificate updated" : "Certificate added", error: "Failed to save certificate" });
    setBusy(false); };
  const remove = async (r: Row) => { await run(async () => { const { error } = await supabase!.from("certifications").delete().eq("id", r.id); if (error) throw error; refresh(); }, { loading: "Deleting…", success: "Certificate deleted", error: "Failed to delete" }); };
  return (<>
    <DataTable<Row> title="Certificates" rows={rows}
      columns={[{ key: "title", label: "Title", render: (r) => <b>{r.title}</b> }, { key: "issuer", label: "Issuer", render: (r) => r.issuer }, { key: "date", label: "Date", render: (r) => r.date_label }]}
      onNew={() => setDraft({ ...empty, sort_order: rows.length })} onEdit={(r) => setDraft(r)} onDelete={remove} />
    <FormDrawer open={!!draft} busy={busy} title={draft?.id ? "Edit certification" : "New certification"} onClose={() => setDraft(null)} onSave={save}>
      {draft && (<>
        <Field label="Title"><input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></Field>
        <Field label="Issuer"><input value={draft.issuer} onChange={(e) => setDraft({ ...draft, issuer: e.target.value })} /></Field>
        <Field label="Date label"><input value={draft.date_label} onChange={(e) => setDraft({ ...draft, date_label: e.target.value })} /></Field>
        <FieldBlock label="Description"><RichTextEditor value={draft.description} onChange={(description) => setDraft({ ...draft, description })} /></FieldBlock>
        <Field label="Certificate image"><ImageUploader value={draft.image} onChange={(path) => setDraft({ ...draft, image: path })} /></Field>
      </>)}
    </FormDrawer>
  </>);
}
