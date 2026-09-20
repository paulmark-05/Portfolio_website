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
  demo_url: string; image: string; images: string[]; sort_order: number; date_value: string;
}
const empty: Row = {
  id: "", slug: "", title: "", description: "", date_label: "", featured: false, active: false,
  tech_stack: [], github_url: "", live_url: "", demo_url: "", image: "", images: [], sort_order: 0,
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
      const hydrated = (data as any[]).map((r) => {
        const row = { ...empty, ...r } as Row;
        // Hydrate the picker for existing rows: prefer stored date_value,
        // otherwise parse it back out of the human date_label.
        if (!row.date_value) row.date_value = parseToValue(row.date_label);
        // Rows saved before multi-photo support only have the single
        // `image` column — fall back to that as the first (only) photo.
        if (!row.images?.length && row.image) row.images = [row.image];
        return row;
      }) as Row[];
      // Listed newest-first here for easier browsing — this is just the
      // admin table's display order; the public site still follows
      // sort_order (and Featured/Active), untouched by this sort.
      return hydrated.sort((a, b) => b.date_value.localeCompare(a.date_value));
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
        // Legacy single-image column stays in sync as the cover/first
        // photo, so anything still reading `image` alone keeps working.
        image: draft.images[0] || "",
      };
      if (!full.id) delete full.id;

      const exec = (payload: any) =>
        draft.id
          ? supabase!.from("projects").update(payload).eq("id", draft.id)
          : supabase!.from("projects").insert(payload);

      let { error } = await exec(full);
      // PostgREST reports a stale schema cache as "Could not find the 'X'
      // column of 'projects' in the schema cache" — strip whichever column
      // it names and retry, so one not-yet-cached column doesn't block
      // saving everything else.
      const safe: any = { ...full };
      while (error) {
        const missing = error.message.match(/Could not find the '(\w+)' column/i)?.[1];
        if (!missing || !(missing in safe)) break;
        delete safe[missing];
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
            <Field label="GitHub URL (optional — shows a Code button)">
              <input value={draft.github_url} onChange={(e) => setDraft({ ...draft, github_url: e.target.value })} placeholder="https://github.com/…" />
            </Field>
            <Field label="Live URL (optional — shows a Live site button)">
              <input value={draft.live_url} onChange={(e) => setDraft({ ...draft, live_url: e.target.value })} placeholder="https://…" />
            </Field>
            <Field label="Demo video URL (optional — shows a Demo button)">
              <input value={draft.demo_url} onChange={(e) => setDraft({ ...draft, demo_url: e.target.value })} placeholder="https://youtube.com/… or a Loom link" />
            </Field>
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
                  <span>Surfaces it in Selected Work on the homepage — otherwise it's only in the full archive</span>
                </label>
              </Field>
            </div>
            <Field label="Preview photos — more than one shows as a collage thumbnail with a click-through gallery">
              <div className="hl-photos-editor">
                {draft.images.map((img, pi) => (
                  <div className="hl-photo-slot" key={pi}>
                    <ImageUploader
                      value={img}
                      onChange={(path) => { const next = [...draft.images]; next[pi] = path; setDraft({ ...draft, images: next }); }}
                      label={`photo ${pi + 1}`}
                    />
                    <button type="button" className="btn btn-ghost danger" onClick={() => setDraft({ ...draft, images: draft.images.filter((_, j) => j !== pi) })}>✕ Remove photo</button>
                  </div>
                ))}
                <button type="button" className="btn btn-ghost" onClick={() => setDraft({ ...draft, images: [...draft.images, ""] })}>+ Add photo</button>
              </div>
            </Field>
          </>
        )}
      </FormDrawer>
    </>
  );
}
