import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabaseClient";
import { Field, FieldBlock } from "../components/FormDrawer";
import ImageUploader from "../components/ImageUploader";
import RichTextEditor from "../components/RichTextEditor";
import { SEED } from "../../lib/content";
import { mediaUrl } from "../../lib/queries";
import { useToast } from "../../context/ToastContext";
import HighlightsSection from "../../components/sections/Highlights";
import type { Highlight } from "../../lib/types";

/** Own admin page for the "Highlights" section — split out of Profile so
 *  it's not buried under sidebar/about editing. Still just a `highlights`
 *  column on the single `profiles` row, updated in isolation so this page
 *  never touches sidebar/about fields it doesn't own. */
export default function HighlightsAdmin() {
  const qc = useQueryClient();
  const { run } = useToast();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [items, setItems] = useState<Highlight[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    supabase!.from("profiles").select("id,highlights,commendation").limit(1).maybeSingle().then(({ data }) => {
      if (data) {
        setProfileId(data.id);
        // migrate the old single `commendation` string on first open, same
        // fallback Profile's editor used to do before this page existed.
        setItems(
          data.highlights ??
          (data.commendation ? [{ icon: "🏅", headline: "", text: data.commendation, image: "" }] : SEED.profile.highlights)
        );
      } else {
        setItems(SEED.profile.highlights);
      }
    });
  }, []);

  const save = async () => {
    if (!items) return;
    setBusy(true);
    await run(async () => {
      let id = profileId;
      if (!id) {
        const { data: sess } = await supabase!.auth.getSession();
        id = sess.session?.user.id ?? null;
      }
      if (!id) throw new Error("No profile row to save to yet.");
      const { error } = await supabase!.from("profiles").update({ highlights: items }).eq("id", id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["site-content"] });
    }, { loading: "Saving highlights…", success: "Highlights updated", error: "Failed to save highlights" });
    setBusy(false);
  };

  if (!items) return <div className="admin-empty">Loading…</div>;

  const update = (i: number, patch: Partial<Highlight>) => {
    const next = [...items]; next[i] = { ...next[i], ...patch }; setItems(next);
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir; if (j < 0 || j >= items.length) return;
    const next = [...items]; [next[i], next[j]] = [next[j], next[i]]; setItems(next);
  };
  const del = (i: number) => setItems(items.filter((_, j) => j !== i));

  const previewHighlights = items.map((h) => ({ ...h, image: mediaUrl(h.image || "") }));

  return (
    <div>
      <div className="admin-toolbar">
        <h1 className="admin-h1">Highlights</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => setPreview(true)}>Preview</button>
          <button className="btn btn-primary" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save"}</button>
        </div>
      </div>
      <p className="admin-hint" style={{ marginBottom: 20 }}>
        Shown in their own "Highlights" section on the page — toggle or reorder it in Page Sections.
      </p>

      <div className="admin-form-grid">
        <div className="highlight-list">
          {items.map((h, i) => (
            <div className="highlight-row" key={i}>
              <div className="highlight-row-head">
                <span className="admin-nav-tag">Highlight {i + 1}</span>
                <div className="rte-list-actions">
                  <button className="btn btn-ghost" style={{ padding: "4px 9px" }} onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
                  <button className="btn btn-ghost" style={{ padding: "4px 9px" }} onClick={() => move(i, 1)} disabled={i === items.length - 1}>↓</button>
                  <button className="btn btn-ghost danger" style={{ padding: "4px 9px" }} onClick={() => del(i)}>✕ Remove</button>
                </div>
              </div>
              <div className="highlight-row-top">
                <Field label="Icon"><input value={h.icon} placeholder="🏅" onChange={(e) => update(i, { icon: e.target.value })} /></Field>
                <Field label="Headline"><input value={h.headline} placeholder="Letter of Commendation" onChange={(e) => update(i, { headline: e.target.value })} /></Field>
              </div>
              <FieldBlock label="Details">
                <RichTextEditor value={h.text} onChange={(text) => update(i, { text })} rows={2} />
              </FieldBlock>
              <Field label="Photo (optional)">
                <ImageUploader value={h.image || ""} onChange={(image) => update(i, { image })} label="highlight photo" />
              </Field>
            </div>
          ))}
          <button className="btn btn-ghost" onClick={() => setItems([...items, { icon: "🏅", headline: "", text: "", image: "" }])}>+ Add highlight</button>
        </div>
      </div>

      {/* LIVE PREVIEW DRAWER — renders the Highlights section from current (unsaved) form values */}
      {preview && (
        <div className="preview-drawer" role="dialog" aria-modal="true">
          <div className="preview-head">
            <span>Live preview — Highlights (unsaved)</span>
            <div className="preview-actions">
              <button className="btn btn-primary" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save"}</button>
              <button className="btn btn-ghost" onClick={() => setPreview(false)}>Close ✕</button>
            </div>
          </div>
          <div className="preview-body">
            <div className="preview-scope" data-theme="light">
              <div className="preview-layout-main" style={{ maxWidth: 900, margin: "0 auto" }}>
                <HighlightsSection highlights={previewHighlights} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
