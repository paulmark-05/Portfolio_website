import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabaseClient";
import { Field } from "../components/FormDrawer";

export default function SeoAdmin() {
  const qc = useQueryClient();
  const [row, setRow] = useState<any>(null); const [busy, setBusy] = useState(false);
  useEffect(() => { supabase!.from("settings").select("*").eq("id", 1).maybeSingle().then(({ data }) => setRow(data ?? { id: 1 })); }, []);
  const save = async () => { setBusy(true);
    const { error } = await supabase!.from("settings").upsert({ id: 1, seo_title: row.seo_title, seo_desc: row.seo_desc, seo_keywords: row.seo_keywords });
    setBusy(false); if (error) return alert(error.message); qc.invalidateQueries({ queryKey: ["site-content"] }); alert("Saved."); };
  if (!row) return <div className="admin-empty">Loading…</div>;
  return (<div>
    <div className="admin-toolbar"><h1 className="admin-h1">SEO</h1><button className="btn btn-primary" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save"}</button></div>
    <div className="admin-form-grid">
      <Field label="Title tag"><input value={row.seo_title || ""} onChange={(e) => setRow({ ...row, seo_title: e.target.value })} /></Field>
      <Field label="Meta description"><textarea rows={3} value={row.seo_desc || ""} onChange={(e) => setRow({ ...row, seo_desc: e.target.value })} /></Field>
      <Field label="Keywords (comma-separated)"><input value={(row.seo_keywords || []).join(", ")} onChange={(e) => setRow({ ...row, seo_keywords: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })} /></Field>
    </div>
  </div>);
}
