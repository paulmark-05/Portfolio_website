import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabaseClient";
import { DataTable } from "../components/DataTable";
import { FormDrawer, Field, FieldBlock } from "../components/FormDrawer";
import ImageUploader from "../components/ImageUploader";
import RichTextEditor from "../components/RichTextEditor";
import TechAutocomplete from "../components/TechAutocomplete";
import { MonthYearPicker, formatMonthYear, parseToValue } from "../components/MonthYearPicker";
import { useToast } from "../../context/ToastContext";

interface Row {
  id: string; slug: string; title: string; description: string; date_label: string;
  featured: boolean; active: boolean; tech_stack: string[]; github_url: string; live_url: string;
  image: string; sort_order: number; date_value: string;
}
const empty: Row = {
  id: "", slug: "", title: "", description: "", date_label: "", featured: false, active: false,
  tech_stack: [], github_url: "", live_url: "", image: "", sort_order: 0,
  date_value: "",
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

export default function ProjectsAdmin() {
  const qc = useQueryClient();
  const { run: runToast } = useToast();
  const { data: rows = [] } = useQuery({
    queryKey: ["admin", "projects"],
    queryFn: async () => {
      const { data, error } = await supabase!.from("projects").select("*").order("sort_order");
      if (error) throw error;
      return (data as any[]).map((r) => {
        const row = { ...empty, ...r } as Row;
        // Hydrate the picker for existing rows: prefer stored date_value,
        // otherwise parse it back out of the human date_label.
        if (!row.date_value) row.date_value = parseToValue(row.date_label);
        return row;
      }) as Row[];
    },
  });
  const [draft, setDraft] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin", "projects"] }); qc.invalidateQueries({ queryKey: ["site-content"] }); };

  const save = async () => {
    if (!draft) return;
    setBusy(true);
    await runToast(async () => {
      // Date label auto-built from the month-year picker — an active
      // (still-ongoing) project shows "— Present" instead of an end date.
      const base = formatMonthYear(draft.date_value);
      const date_label = draft.active
        ? (base ? `${base} — Present` : "Present")
        : base || draft.date_label;
      const full: any = {
        ...draft,
        slug: draft.slug || slugify(draft.title) || `project-${Date.now()}`,
        date_label,
      };
      if (!full.id) delete full.id;

      const exec = (payload: any) =>
        draft.id
          ? supabase!.from("projects").update(payload).eq("id", draft.id)
          : supabase!.from("projects").insert(payload);

      let { error } = await exec(full);
      if (error && /column .*(date_value|active)/i.test(error.message)) {
        const { date_value, active, ...safe } = full;
        ({ error } = await exec(safe));
      }
      if (error) throw error;
      setDraft(null);
      refresh();
    }, { loading: draft.id ? "Saving…" : "Adding…", success: draft.id ? "Project updated" : "Project added", error: "Failed to save project" });
    setBusy(false);
  };

  const remove = async (r: Row) => {
    await runToast(async () => { const { error } = await supabase!.from("projects").delete().eq("id", r.id); if (error) throw error; refresh(); },
      { loading: "Deleting…", success: "Project deleted", error: "Failed to delete project" });
  };

  return (
    <>
      <DataTable<Row>
        title="Projects"
        rows={rows}
        columns={[
          { key: "title", label: "Title", render: (r) => <b>{r.title}</b> },
          { key: "date", label: "Date", render: (r) => r.date_label },
          { key: "featured", label: "Featured", render: (r) => (r.featured ? "★" : "—") },
        ]}
        onNew={() => setDraft({ ...empty, sort_order: rows.length })}
        onEdit={(r) => setDraft(r)}
        onDelete={remove}
      />
      <FormDrawer open={!!draft} busy={busy} title={draft?.id ? "Edit project" : "New project"} onClose={() => setDraft(null)} onSave={save}>
        {draft && (
          <>
            <Field label="Title"><input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></Field>
            <Field label="Date">
              <MonthYearPicker value={draft.date_value} onChange={(v) => setDraft({ ...draft, date_value: v })} disabled={false} />
            </Field>
            <FieldBlock label="Description">
              <RichTextEditor value={draft.description} onChange={(description) => setDraft({ ...draft, description })} rows={4} allowHighlight />
            </FieldBlock>
            <Field label="Tech stack (type to search — no manual typing of lists)">
              <TechAutocomplete value={draft.tech_stack} onChange={(tech_stack) => setDraft({ ...draft, tech_stack })} />
            </Field>
            <Field label="GitHub URL"><input value={draft.github_url} onChange={(e) => setDraft({ ...draft, github_url: e.target.value })} /></Field>
            <Field label="Live URL"><input value={draft.live_url} onChange={(e) => setDraft({ ...draft, live_url: e.target.value })} /></Field>
            <div className="admin-2col">
              <Field label="Active">
                <label className="admin-check">
                  <input type="checkbox" checked={draft.active}
                    onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />
                  <span>Still ongoing — shows an Active badge, “— Present” on the date, and counts toward the active metric</span>
                </label>
              </Field>
              <Field label="Featured">
                <label className="admin-check">
                  <input type="checkbox" checked={draft.featured}
                    onChange={(e) => setDraft({ ...draft, featured: e.target.checked })} />
                  <span>Shows a Featured badge and surfaces it in Selected Work</span>
                </label>
              </Field>
            </div>
            <Field label="Preview image">
              <ImageUploader value={draft.image} onChange={(path) => setDraft({ ...draft, image: path })} label="preview image" />
            </Field>
          </>
        )}
      </FormDrawer>
    </>
  );
}
