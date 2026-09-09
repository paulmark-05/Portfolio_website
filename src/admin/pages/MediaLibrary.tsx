import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { mediaUrl } from "../../lib/queries";
import { useContent } from "../../hooks/useContent";
import ImageUploader from "../components/ImageUploader";

/** A media file's known usages across the site content. */
function useUsageMap() {
  const { content } = useContent();
  return useMemo(() => {
    const map = new Map<string, string[]>();
    const add = (path: string, where: string) => {
      if (!path) return;
      // normalise to the storage path tail so it matches list() entries
      const key = path.replace(/^.*\/(uploads\/[^?]+)(\?.*)?$/, "$1");
      const arr = map.get(key) || [];
      arr.push(where);
      map.set(key, arr);
    };
    add(content.profile.heroImage, "Hero Section");
    add(content.profile.aboutImage, "About Section");
    add(content.profile.stackImage, "Tech Stack");
    add(content.settings.contactImage, "Contact Section");
    content.projects.forEach((p) => add(p.image, `Project: ${p.title}`));
    content.certifications.forEach((c) => add(c.image, `Certificate: ${c.title}`));
    content.skills.forEach((s) => s.logo && add(s.logo, `Skill: ${s.fullName || s.name}`));
    return map;
  }, [content]);
}

export default function MediaLibrary() {
  const [files, setFiles] = useState<string[]>([]);
  const usage = useUsageMap();

  const load = async () => {
    const { data } = await supabase!.storage.from("media").list("uploads", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
    setFiles((data || []).filter((f) => f.name && !f.name.startsWith(".")).map((f) => `uploads/${f.name}`));
  };
  useEffect(() => { load(); }, []);

  const del = async (path: string) => {
    const where = usage.get(path);
    const warn = where?.length
      ? `This file is used in:\n• ${where.join("\n• ")}\n\nDelete anyway? Those spots will fall back to a placeholder.`
      : "Delete this file?";
    if (!confirm(warn)) return;
    await supabase!.storage.from("media").remove([path]);
    load();
  };

  const rename = async (path: string) => {
    const current = path.replace(/^uploads\//, "");
    const next = prompt("New filename (keep the extension):", current);
    if (!next || next === current) return;
    const dest = `uploads/${next.replace(/[^a-z0-9._-]+/gi, "-")}`;
    const { error } = await supabase!.storage.from("media").move(path, dest);
    if (error) return alert(error.message);
    load();
  };

  return (
    <div>
      <div className="admin-toolbar"><h1 className="admin-h1">Media Library</h1></div>
      <p style={{ color: "var(--muted)", margin: "0 0 18px", fontSize: 14 }}>
        Upload images here, then assign them in Profile, Projects, Certificates or Contact. Each card shows where it's currently used.
      </p>
      <div style={{ marginBottom: 20 }}><ImageUploader value="" onChange={load} label="image" /></div>
      <div className="admin-media-grid">
        {files.map((p) => {
          const where = usage.get(p) || [];
          const filename = p.replace(/^uploads\//, "");
          return (
            <div className="admin-media-item" key={p}>
              <img src={mediaUrl(p)} alt="" onError={(e) => ((e.currentTarget as HTMLImageElement).style.opacity = "0.2")} />
              <div className="admin-media-meta">
                <div className="admin-media-name" title={filename}>{filename}</div>
                <div className="admin-media-usage">
                  {where.length
                    ? <>Used in:<ul>{where.map((w) => <li key={w}>{w}</li>)}</ul></>
                    : <span className="unused">Not used yet</span>}
                </div>
              </div>
              <div className="admin-media-actions">
                <button className="btn btn-ghost" onClick={() => rename(p)}>Edit</button>
                <button className="btn btn-ghost danger" onClick={() => del(p)}>Delete</button>
              </div>
            </div>
          );
        })}
        {!files.length && <div className="admin-empty">No uploads yet.</div>}
      </div>
    </div>
  );
}
