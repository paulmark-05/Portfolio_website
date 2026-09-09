import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabaseClient";
import { Field } from "../components/FormDrawer";
import RichTextEditor from "../components/RichTextEditor";
import { useToast } from "../../context/ToastContext";

export default function ContactAdmin() {
  const qc = useQueryClient();
  const { run } = useToast();
  const [row, setRow] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { supabase!.from("settings").select("*").eq("id", 1).maybeSingle().then(({ data }) => setRow(data ?? { id: 1 })); }, []);

  const save = async () => {
    setBusy(true);
    await run(async () => {
      const full: any = {
        id: 1, email: row.email, linkedin: row.linkedin, github: row.github,
        contact_image: row.contact_image, contact_eyebrow: row.contact_eyebrow,
        contact_heading: row.contact_heading, contact_description: row.contact_description,
      };
      let { error } = await supabase!.from("settings").upsert(full);
      if (error && /column .*(contact_eyebrow|contact_heading|contact_description)/i.test(error.message)) {
        const { contact_eyebrow, contact_heading, contact_description, ...safe } = full;
        ({ error } = await supabase!.from("settings").upsert(safe));
      }
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["site-content"] });
    }, { loading: "Saving contact…", success: "Contact updated", error: "Failed to save contact" });
    setBusy(false);
  };

  if (!row) return <div className="admin-empty">Loading…</div>;
  return (<div>
    <div className="admin-toolbar"><h1 className="admin-h1">Contact</h1>
      <button className="btn btn-primary" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save"}</button></div>
    <div className="admin-form-grid">
      <h2 className="admin-section-h">Section content</h2>
      <Field label="Main heading">
        <RichTextEditor value={row.contact_heading || ""} onChange={(contact_heading) => setRow({ ...row, contact_heading })} rows={2} placeholder="Got an interesting problem? Send it over." />
      </Field>
      <Field label="Description">
        <RichTextEditor value={row.contact_description || ""} onChange={(contact_description) => setRow({ ...row, contact_description })} />
      </Field>

      <h2 className="admin-section-h">Links</h2>
      <Field label="Email"><input value={row.email || ""} onChange={(e) => setRow({ ...row, email: e.target.value })} /></Field>
      <Field label="LinkedIn URL"><input value={row.linkedin || ""} onChange={(e) => setRow({ ...row, linkedin: e.target.value })} /></Field>
      <Field label="GitHub URL"><input value={row.github || ""} onChange={(e) => setRow({ ...row, github: e.target.value })} /></Field>
    </div>
  </div>);
}
