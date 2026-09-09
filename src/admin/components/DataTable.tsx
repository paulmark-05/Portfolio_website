import type { ReactNode } from "react";

export function DataTable<T extends { id: string }>({
  rows, columns, onEdit, onDelete, onNew, title,
}: {
  rows: T[];
  columns: { key: string; label: string; render: (r: T) => ReactNode }[];
  onEdit: (r: T) => void;
  onDelete: (r: T) => void;
  onNew: () => void;
  title: string;
}) {
  return (
    <div>
      <div className="admin-toolbar">
        <h1 className="admin-h1">{title}</h1>
        <button className="btn btn-primary" onClick={onNew}>+ New</button>
      </div>
      <div className="admin-table">
        <div className="admin-tr admin-th">
          {columns.map((c) => <div key={c.key}>{c.label}</div>)}
          <div style={{ textAlign: "right" }}>Actions</div>
        </div>
        {rows.map((r) => (
          <div className="admin-tr" key={r.id}>
            {columns.map((c) => <div key={c.key}>{c.render(r)}</div>)}
            <div className="admin-row-actions">
              <button className="btn btn-ghost" onClick={() => onEdit(r)}>Edit</button>
              <button className="btn btn-ghost danger" onClick={() => { if (confirm("Delete this item?")) onDelete(r); }}>Delete</button>
            </div>
          </div>
        ))}
        {!rows.length && <div className="admin-empty">Nothing yet — create your first item.</div>}
      </div>
    </div>
  );
}
