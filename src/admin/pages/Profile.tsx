import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabaseClient";
import { Field } from "../components/FormDrawer";
import ImageUploader from "../components/ImageUploader";
import RichTextEditor from "../components/RichTextEditor";
import { SEED } from "../../lib/content";
import { mediaUrl } from "../../lib/queries";
import { useToast } from "../../context/ToastContext";
import Sidebar from "../../components/layout/Sidebar";
import About from "../../components/sections/About";
import type { Profile, InfoCard, Highlight, Settings } from "../../lib/types";

const EMPTY_SETTINGS: Settings = {
  email: "", linkedin: "", github: "", contactImage: "",
  contactEyebrow: "", contactHeading: "", contactDescription: "",
  stackTitle: "", stackQuote: "", stackDescription: "",
  seoTitle: "", seoDesc: "", seoKeywords: [], sections: [],
};

export default function ProfileAdmin() {
  const qc = useQueryClient();
  const { run } = useToast();
  const [row, setRow] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    supabase!.from("profiles").select("*").limit(1).maybeSingle().then(({ data }) => {
      if (data) {
        // migrate the old single `commendation` string into the new
        // `highlights` list the first time this row is opened in the admin.
        if (!data.highlights && data.commendation) {
          data.highlights = [{ icon: "🏅", text: data.commendation }];
        }
        setRow(data);
      } else {
        setRow({
          name: SEED.profile.name, title: SEED.profile.title,
          availability_badge: SEED.profile.availabilityBadge,
          subtitle: SEED.profile.subtitle, resume_url: "",
          cta_primary: SEED.profile.ctaPrimary, roles: SEED.profile.roles,
          about_md: SEED.profile.aboutParagraphs.join("\n\n"),
          highlights: SEED.profile.highlights,
          info_cards: SEED.profile.infoCards,
          hero_image: "",
        });
      }
    });
  }, []);

  const save = async () => {
    setBusy(true);
    await run(async () => {
      const { data: sess } = await supabase!.auth.getSession();
      const id = sess.session?.user.id;
      const full: any = {
        name: row.name, title: row.title, availability_badge: row.availability_badge,
        subtitle: row.subtitle, resume_url: row.resume_url,
        cta_primary: row.cta_primary, roles: row.roles,
        about_md: row.about_md, highlights: row.highlights,
        info_cards: row.info_cards, hero_image: row.hero_image,
      };
      let { error } = await supabase!.from("profiles").update(full).eq("id", id);
      if (error && /column .*(availability_badge|info_cards|highlights|roles)/i.test(error.message)) {
        const { availability_badge, info_cards, highlights, roles, ...safe } = full;
        ({ error } = await supabase!.from("profiles").update(safe).eq("id", id));
      }
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["site-content"] });
    }, { loading: "Saving profile…", success: "Profile updated", error: "Failed to save profile" });
    setBusy(false);
  };

  if (!row) return <div className="admin-empty">Loading…</div>;

  const roles: string[] = row.roles || [];
  const setRoles = (next: string[]) => setRow({ ...row, roles: next });

  const rawParas = (row.about_md || "").split("\n\n").filter((p: string) => p.trim() !== "");
  const paras: string[] = rawParas.length ? rawParas : [""];
  const setParas = (next: string[]) => setRow({ ...row, about_md: next.join("\n\n") });

  // Build a live Profile object from current (unsaved) form values for preview.
  const previewProfile: Profile = {
    name: row.name || "", title: row.title || "",
    availabilityBadge: row.availability_badge || "",
    subtitle: row.subtitle || "", roles,
    ctaPrimary: { label: "", href: "" }, ctaGhost: { label: "", href: "" }, resumeUrl: row.resume_url || "",
    aboutParagraphs: (row.about_md || "").split("\n\n").filter(Boolean),
    aboutTitle: "", quickFacts: [], infoCards: row.info_cards || [],
    highlights: row.highlights ?? SEED.profile.highlights,
    aboutImage: "", heroImage: mediaUrl(row.hero_image || ""), stackImage: "",
  };

  return (
    <div>
      <div className="admin-toolbar">
        <h1 className="admin-h1">Profile · Sidebar &amp; About</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => setPreview(true)}>Preview</button>
          <button className="btn btn-primary" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save"}</button>
        </div>
      </div>

      <div className="admin-form-grid">
        <h2 className="admin-section-h">Sidebar photo</h2>
        <Field label="Photo (square works best — shown at the top of the sidebar)">
          <ImageUploader value={row.hero_image || ""} onChange={(p) => setRow({ ...row, hero_image: p })} label="sidebar photo" />
        </Field>
        {row.hero_image ? null : <p className="admin-hint">No photo set — the sidebar shows your initials instead.</p>}

        <h2 className="admin-section-h">Sidebar content</h2>
        <Field label="Availability badge"><input value={row.availability_badge || ""} placeholder="Open to internships" onChange={(e) => setRow({ ...row, availability_badge: e.target.value })} /></Field>
        <Field label="Tagline (shown if no rotating roles are set below)"><input value={row.title || ""} onChange={(e) => setRow({ ...row, title: e.target.value })} /></Field>
        <Field label="Résumé URL"><input value={row.resume_url || ""} onChange={(e) => setRow({ ...row, resume_url: e.target.value })} /></Field>
        <p className="admin-hint">The sidebar's "Contact me" button always scrolls to the Contact section.</p>

        <h2 className="admin-section-h">Rotating role titles</h2>
        <div className="infocard-editor">
          {roles.map((r, i) => (
            <div className="infocard-row" key={i}>
              <input className="infocard-text" value={r} placeholder="Full-Stack Engineer" onChange={(e) => { const next = [...roles]; next[i] = e.target.value; setRoles(next); }} />
              <button className="btn btn-ghost" style={{ padding: "4px 9px" }} onClick={() => { const j = i - 1; if (j < 0) return; const next = [...roles]; [next[i], next[j]] = [next[j], next[i]]; setRoles(next); }}>↑</button>
              <button className="btn btn-ghost" style={{ padding: "4px 9px" }} onClick={() => { const j = i + 1; if (j >= roles.length) return; const next = [...roles]; [next[i], next[j]] = [next[j], next[i]]; setRoles(next); }}>↓</button>
              <button className="btn btn-ghost danger" style={{ padding: "4px 9px" }} onClick={() => setRoles(roles.filter((_, j) => j !== i))}>✕</button>
            </div>
          ))}
          <button className="btn btn-ghost" onClick={() => setRoles([...roles, ""])}>+ Add role</button>
        </div>

        <h2 className="admin-section-h">Sidebar info lines (e.g. school, location, GPA)</h2>
        <div className="infocard-editor">
          {(row.info_cards || []).map((c: InfoCard, i: number) => {
            const cards = [...(row.info_cards || [])];
            const update = (patch: Partial<InfoCard>) => { cards[i] = { ...cards[i], ...patch }; setRow({ ...row, info_cards: cards }); };
            const move = (dir: -1 | 1) => { const j = i + dir; if (j < 0 || j >= cards.length) return; [cards[i], cards[j]] = [cards[j], cards[i]]; setRow({ ...row, info_cards: cards }); };
            const del = () => { cards.splice(i, 1); setRow({ ...row, info_cards: cards }); };
            return (
              <div className="infocard-row" key={i}>
                <input className="infocard-text" value={c.text} onChange={(e) => update({ text: e.target.value })} placeholder="Kolkata, India" />
                <label className="admin-check infocard-vis"><input type="checkbox" checked={c.visible} onChange={(e) => update({ visible: e.target.checked })} /><span>Visible</span></label>
                <button className="btn btn-ghost" style={{ padding: "4px 9px" }} onClick={() => move(-1)}>↑</button>
                <button className="btn btn-ghost" style={{ padding: "4px 9px" }} onClick={() => move(1)}>↓</button>
                <button className="btn btn-ghost danger" style={{ padding: "4px 9px" }} onClick={del}>✕</button>
              </div>
            );
          })}
          <button className="btn btn-ghost" onClick={() => setRow({ ...row, info_cards: [...(row.info_cards || []), { icon: "", text: "", visible: true }] })}>+ Add line</button>
        </div>

        <h2 className="admin-section-h">About paragraphs</h2>
        <div className="rte-list">
          {paras.map((p, i) => (
            <div className="rte-list-item" key={i}>
              <RichTextEditor value={p} onChange={(html) => { const next = [...paras]; next[i] = html; setParas(next); }} />
              <div className="rte-list-actions">
                <button className="btn btn-ghost" style={{ padding: "4px 9px" }} onClick={() => { const j = i - 1; if (j < 0) return; const next = [...paras]; [next[i], next[j]] = [next[j], next[i]]; setParas(next); }}>↑</button>
                <button className="btn btn-ghost" style={{ padding: "4px 9px" }} onClick={() => { const j = i + 1; if (j >= paras.length) return; const next = [...paras]; [next[i], next[j]] = [next[j], next[i]]; setParas(next); }}>↓</button>
                <button className="btn btn-ghost danger" style={{ padding: "4px 9px" }} onClick={() => setParas(paras.length > 1 ? paras.filter((_, j) => j !== i) : [""])}>✕ Remove</button>
              </div>
            </div>
          ))}
          <button className="btn btn-ghost" onClick={() => setParas([...paras, ""])}>+ Add paragraph</button>
        </div>

        <h2 className="admin-section-h">Highlight cards</h2>
        <p className="admin-hint">One below another beside the sidebar; two-up once it's retracted. Icon can be any emoji.</p>
        <div className="rte-list">
          {(row.highlights || []).map((h: Highlight, i: number) => {
            const items: Highlight[] = row.highlights || [];
            const update = (patch: Partial<Highlight>) => { const next = [...items]; next[i] = { ...next[i], ...patch }; setRow({ ...row, highlights: next }); };
            const move = (dir: -1 | 1) => { const j = i + dir; if (j < 0 || j >= items.length) return; const next = [...items]; [next[i], next[j]] = [next[j], next[i]]; setRow({ ...row, highlights: next }); };
            const del = () => setRow({ ...row, highlights: items.filter((_, j) => j !== i) });
            return (
              <div className="rte-list-item" key={i}>
                <input className="infocard-text" style={{ maxWidth: 70 }} value={h.icon} placeholder="🏅" onChange={(e) => update({ icon: e.target.value })} />
                <RichTextEditor value={h.text} onChange={(text) => update({ text })} rows={2} />
                <div className="rte-list-actions">
                  <button className="btn btn-ghost" style={{ padding: "4px 9px" }} onClick={() => move(-1)}>↑</button>
                  <button className="btn btn-ghost" style={{ padding: "4px 9px" }} onClick={() => move(1)}>↓</button>
                  <button className="btn btn-ghost danger" style={{ padding: "4px 9px" }} onClick={del}>✕ Remove</button>
                </div>
              </div>
            );
          })}
          <button className="btn btn-ghost" onClick={() => setRow({ ...row, highlights: [...(row.highlights || []), { icon: "🏅", text: "" }] })}>+ Add highlight</button>
        </div>
      </div>

      {/* LIVE PREVIEW DRAWER — renders Sidebar + About from current form values */}
      {preview && (
        <div className="preview-drawer" role="dialog" aria-modal="true">
          <div className="preview-head">
            <span>Live preview — Sidebar &amp; About (unsaved)</span>
            <div className="preview-actions">
              <button className="btn btn-primary" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save"}</button>
              <button className="btn btn-ghost" onClick={() => setPreview(false)}>Close ✕</button>
            </div>
          </div>
          <div className="preview-body">
            <div className="preview-scope" data-theme="light">
              <div className="preview-layout">
                <Sidebar profile={previewProfile} settings={EMPTY_SETTINGS} open onToggle={() => {}} />
                <div className="preview-layout-main">
                  <About profile={previewProfile} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
