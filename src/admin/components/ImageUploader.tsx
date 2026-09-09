import { useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { mediaUrl } from "../../lib/queries";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB raw upload ceiling (pre-downscale)
const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"];

/**
 * Reusable image field for the CMS.
 * - Upload: client-side downscale to <=1400px WebP, store in the `media` bucket.
 * - Preview: shows the current image (works for both storage paths and URLs).
 * - Replace: choosing a new file overwrites the field value.
 * - Delete: clears the field (and removes the object from storage if we own it).
 * - Validation: type + size checks before any network call.
 *
 * The component is storage-agnostic from the caller's view: it only ever emits a
 * string path/URL via onChange, and never hardcodes a path. Any new image field
 * (hero, about, contact, project, or future ones) reuses this with no duplication.
 */
export default function ImageUploader({
  value,
  onChange,
  label = "image",
}: {
  value: string;
  onChange: (path: string) => void;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (file: File): string | null => {
    if (!ACCEPTED.includes(file.type)) return "Use a PNG, JPEG, WebP, GIF, or AVIF image.";
    if (file.size > MAX_BYTES) return "Image is larger than 8 MB. Please pick a smaller file.";
    return null;
  };

  const upload = async (file: File) => {
    setErr(null);
    if (!supabase) { setErr("Supabase isn't configured."); return; }
    const v = validate(file);
    if (v) { setErr(v); return; }

    setBusy(true);
    try {
      const blob = await downscale(file, 1400);
      const safeName = file.name.replace(/[^a-z0-9.]+/gi, "-").toLowerCase();
      const path = `uploads/${Date.now()}-${safeName}`;
      const { error } = await supabase.storage
        .from("media")
        .upload(path, blob, { upsert: true, contentType: blob.type });
      if (error) throw error;
      onChange(path);
    } catch (e: any) {
      setErr(e?.message ?? "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = async () => {
    setErr(null);
    // Only attempt a storage delete for objects we uploaded (storage paths,
    // not absolute URLs or bundled /images/* assets).
    const isStoragePath = value && !/^https?:\/\//.test(value) && !value.startsWith("/");
    if (isStoragePath && supabase) {
      try { await supabase.storage.from("media").remove([value]); } catch { /* non-fatal */ }
    }
    onChange("");
  };

  const resolved = value ? mediaUrl(value) : "";

  return (
    <div className="admin-uploader">
      {resolved ? (
        <div className="admin-uploader-preview">
          <img
            src={resolved}
            alt={`${label} preview`}
            className="admin-thumb"
            onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
          />
          <div className="admin-uploader-actions">
            <button type="button" className="btn btn-ghost" disabled={busy}
              onClick={() => inputRef.current?.click()}>Replace</button>
            <button type="button" className="btn btn-ghost danger" disabled={busy}
              onClick={remove}>Delete</button>
          </div>
        </div>
      ) : (
        <button type="button" className="btn btn-ghost" disabled={busy}
          onClick={() => inputRef.current?.click()}>
          {busy ? "Uploading…" : `Upload ${label}`}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        hidden
        disabled={busy}
        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
      />

      {busy && <span className="admin-uploader-hint">Uploading…</span>}
      {err && <span className="admin-error" role="alert">{err}</span>}
    </div>
  );
}

async function downscale(file: File, maxW: number): Promise<Blob> {
  // GIFs can be animated — don't rasterize to a single frame; upload as-is.
  if (file.type === "image/gif") return file;
  try {
    const img = await createImageBitmap(file);
    if (img.width <= maxW) return file;
    const scale = maxW / img.width;
    const canvas = document.createElement("canvas");
    canvas.width = maxW;
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((res) =>
      canvas.toBlob((b) => res(b || file), "image/webp", 0.85)
    );
  } catch {
    return file; // if decode fails (e.g. exotic format), upload original
  }
}
