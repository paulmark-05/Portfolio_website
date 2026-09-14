import type { ReactNode } from "react";

export function FormDrawer({ open, title, onClose, onSave, children, busy }: {
  open: boolean; title: string; onClose: () => void; onSave: () => void;
  children: ReactNode; busy?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="admin-drawer-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="admin-drawer">
        <div className="admin-drawer-head">
          <h3>{title}</h3>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>
        <div className="admin-drawer-body">{children}</div>
        <div className="admin-drawer-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onSave} disabled={busy}>{busy ? "Saving…" : "Save"}</button>
        </div>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="admin-field"><span>{label}</span>{children}</label>;
}

/** Same look as Field, but a <div> instead of a <label>. Required for
 *  contentEditable children (RichTextEditor) — a <label> expects a native
 *  form control, and wrapping a contentEditable in one makes some browsers
 *  reset the caret to the start on click/selection instead of placing it
 *  where you clicked. */
export function FieldBlock({ label, children }: { label: string; children: ReactNode }) {
  return <div className="admin-field"><span>{label}</span>{children}</div>;
}
