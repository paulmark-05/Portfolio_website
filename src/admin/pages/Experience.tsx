import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabaseClient";
import { DataTable } from "../components/DataTable";
import { FormDrawer, Field, FieldBlock } from "../components/FormDrawer";
import RichTextEditor from "../components/RichTextEditor";
import ImageUploader from "../components/ImageUploader";
import { MonthYearPicker, formatRange, parseToValue } from "../components/MonthYearPicker";
import TechAutocomplete from "../components/TechAutocomplete";

interface Row {
  id: string; company: string; role: string; duration: string; step_label: string;
  description: string; tags: string[]; achievements: string[]; sort_order: number;
  start_date: string; end_date: string; current: boolean; location: string; logo: string;
}
const empty: Row = {
  id: "", company: "", role: "", duration: "", step_label: "", description: "",
  tags: [], achievements: [], sort_order: 0,
  start_date: "", end_date: "", current: false, location: "", logo: "",
};

export default function ExperienceAdmin() {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({ queryKey: ["admin", "experience"], queryFn: async () => {
    const { data, error } = await supabase!.from("experience").select("*").order("sort_order"); if (error) throw error;
    return (data as any[]).map((r) => {
      const row = { ...empty, ...r } as Row;
      const isCurrent = r.current != null ? r.current : /present/i.test(row.duration);
      row.current = isCurrent;
      // Hydrate pickers for existing rows from the stored duration label.
      if (!row.start_date || !row.end_date) {
        const parts = row.duration.split(/\s+(?:to|—)\s+/);
        if (!row.start_date) row.start_date = parseToValue(parts[0] || "");
        if (!row.end_date && !isCurrent) row.end_date = parseToValue(parts[1] || "");
      }
      if (!row.location) {
        const loc = row.duration.split("·")[1];
        if (loc) row.location = loc.trim();
      }
      return row;
    }) as Row[];
  }});
  const [draft, setDraft] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin", "experience"] }); qc.invalidateQueries({ queryKey: ["site-content"] }); };

  const save = async () => {
    if (!draft) return;
    setBusy(true);
    // Date range + location are auto-composed into the public `duration` label.
    const range = formatRange(draft.start_date, draft.end_date, draft.current);
    const duration = draft.location ? `${range} · ${draft.location}` : range;
    const full: any = {
      ...draft,
      duration,
      step_label: draft.current ? "Currently shipping" : "Experience",
    };
    if (!full.id) delete full.id;

    const run = (payload: any) =>
      draft.id
        ? supabase!.from("experience").update(payload).eq("id", draft.id)
        : supabase!.from("experience").insert(payload);

    let { error } = await run(full);
    // Retry without the optional new columns if the DB doesn't have them yet.
    if (error && /column .*(start_date|end_date|current|location|logo)/i.test(error.message)) {
      const { start_date, end_date, current, location, logo, ...safe } = full;
      ({ error } = await run(safe));
    }
    setBusy(false); if (error) return alert(error.message); setDraft(null); refresh();
  };
  const remove = async (r: Row) => { await supabase!.from("experience").delete().eq("id", r.id); refresh(); };

  return (<>
    <DataTable<Row> title="Experience" rows={rows}
      columns={[{ key: "role", label: "Role", render: (r) => <b>{r.role}</b> }, { key: "company", label: "Company", render: (r) => r.company }, { key: "when", label: "When", render: (r) => r.duration }]}
      onNew={() => setDraft({ ...empty, sort_order: rows.length })} onEdit={(r) => setDraft(r)} onDelete={remove} />
    <FormDrawer open={!!draft} busy={busy} title={draft?.id ? "Edit experience" : "New experience"} onClose={() => setDraft(null)} onSave={save}>
      {draft && (<>
        <Field label="Role"><input value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} /></Field>
        <Field label="Company / org"><input value={draft.company} onChange={(e) => setDraft({ ...draft, company: e.target.value })} /></Field>
        <Field label="Company logo (optional — shows colored initials if empty)">
          <ImageUploader value={draft.logo} onChange={(logo) => setDraft({ ...draft, logo })} label="company logo" />
        </Field>
        <Field label="Start date">
          <MonthYearPicker value={draft.start_date} onChange={(v) => setDraft({ ...draft, start_date: v })} />
        </Field>
        <Field label="End date">
          <MonthYearPicker value={draft.end_date} onChange={(v) => setDraft({ ...draft, end_date: v })} disabled={draft.current} />
        </Field>
        <Field label="Status">
          <label className="admin-check">
            <input type="checkbox" checked={draft.current}
              onChange={(e) => setDraft({ ...draft, current: e.target.checked, end_date: e.target.checked ? "" : draft.end_date })} />
            <span>Currently working here (end date becomes “Present”)</span>
          </label>
        </Field>
        <Field label="Location (optional)"><input value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} placeholder="Kolkata" /></Field>
        <div className="tech-preview"><span>Date label preview: <b>{formatRange(draft.start_date, draft.end_date, draft.current) || "—"}</b></span></div>
        <FieldBlock label="Description"><RichTextEditor value={draft.description} onChange={(description) => setDraft({ ...draft, description })} rows={4} /></FieldBlock>
        <Field label="Tech tags (type to search)">
          <TechAutocomplete value={draft.tags} onChange={(tags) => setDraft({ ...draft, tags })} />
        </Field>
      </>)}
    </FormDrawer>
  </>);
}
