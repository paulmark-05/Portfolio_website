import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabaseClient";
import { Field } from "../components/FormDrawer";
import RichTextEditor from "../components/RichTextEditor";
import { SEED } from "../../lib/content";
import { mediaUrl } from "../../lib/queries";
import { useToast } from "../../context/ToastContext";
import Sidebar from "../../components/layout/Sidebar";
import About from "../../components/sections/About";
import type { Profile, Settings } from "../../lib/types";

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
  const [links, setLinks] = useState<{ github: string; linkedin: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    supabase!.from("profiles").select("*").limit(1).maybeSingle().then(({ data }) => {
      if (data) {
        setRow(data);
      } else {
        setRow({
          name: SEED.profile.name, title: SEED.profile.title,
          availability_badge: SEED.profile.availabilityBadge,
          subtitle: SEED.profile.subtitle, resume_url: "",
          cta_primary: SEED.profile.ctaPrimary, roles: SEED.profile.roles,
          about_md: SEED.profile.aboutParagraphs.join("\n\n"),
          info_cards: SEED.profile.infoCards,
          hero_image: "",
        });
      }
    });
    // GitHub/LinkedIn live on the shared `settings` row (same one Contact
    // edits) — fetched here too since they now show as sidebar icons
    // alongside the rest of this identity block.
    supabase!.from("settings").select("github,linkedin").eq("id", 1).maybeSingle().then(({ data }) => {
      setLinks({ github: data?.github ?? "", linkedin: data?.linkedin ?? "" });
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
        about_md: row.about_md,
        info_cards: row.info_cards, hero_image: row.hero_image,
      };
      let { error } = await supabase!.from("profiles").update(full).eq("id", id);
      if (error && /column .*(availability_badge|info_cards|roles)/i.test(error.message)) {
        const { availability_badge, info_cards, roles, ...safe } = full;
        ({ error } = await supabase!.from("profiles").update(safe).eq("id", id));
      }
      if (error) throw error;
      if (links) {
        const { error: linkErr } = await supabase!.from("settings").upsert({ id: 1, github: links.github, linkedin: links.linkedin });
        if (linkErr) throw linkErr;
      }
      qc.invalidateQueries({ queryKey: ["site-content"] });
    }, { loading: "Saving profile…", success: "Profile updated", error: "Failed to save profile" });
    setBusy(false);
  };

  if (!row || !links) return <div className="admin-empty">Loading…</div>;

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
    highlights: [],
    aboutImage: "", heroImage: mediaUrl(row.hero_image || ""), stackImage: "",
  };
  const previewSettings: Settings = { ...EMPTY_SETTINGS, github: links.github, linkedin: links.linkedin };

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
        <h2 className="admin-section-h">Sidebar content</h2>
        <p className="admin-hint" style={{ marginTop: -8, marginBottom: 16 }}>
          Everything here shows permanently in the left sidebar — there's no separate "Main" section on the page anymore.
        </p>
        <Field label="Availability badge"><input value={row.availability_badge || ""} placeholder="Open to internships" onChange={(e) => setRow({ ...row, availability_badge: e.target.value })} /></Field>
        <Field label="Name"><input value={row.name || ""} onChange={(e) => setRow({ ...row, name: e.target.value })} placeholder={SEED.profile.name} /></Field>
        <Field label="Tagline"><input value={row.title || ""} onChange={(e) => setRow({ ...row, title: e.target.value })} /></Field>
        <Field label="Résumé URL — shown as a sidebar icon"><input value={row.resume_url || ""} onChange={(e) => setRow({ ...row, resume_url: e.target.value })} placeholder="https://…" /></Field>
        <Field label="GitHub URL — shown as a sidebar icon"><input value={links.github} onChange={(e) => setLinks({ ...links, github: e.target.value })} placeholder="https://github.com/…" /></Field>
        <Field label="LinkedIn URL — shown as a sidebar icon"><input value={links.linkedin} onChange={(e) => setLinks({ ...links, linkedin: e.target.value })} placeholder="https://linkedin.com/in/…" /></Field>
        <p className="admin-hint">Email is edited on the Contact page — it's shared with the Contact section's own links.</p>

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
                <Sidebar profile={previewProfile} settings={previewSettings} open onToggle={() => {}} />
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
