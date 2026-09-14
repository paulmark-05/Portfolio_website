import { useLayoutEffect, useRef } from "react";

const icBold = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z" /></svg>
);
const icItalic = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" /></svg>
);
const icUnderline = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4v6a6 6 0 0 0 12 0V4" /><line x1="4" y1="20" x2="20" y2="20" /></svg>
);
const icUndo = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14 4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-1" /></svg>
);
const icRedo = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 14 5-5-5-5" /><path d="M20 9H10a6 6 0 0 0 0 12h1" /></svg>
);

/** Small inline rich-text editor — Bold / Italic / Underline (and an
 *  optional "Highlight" button that wraps the selection in the site's
 *  <span class="m"> metric-emphasis tag). Uses contentEditable +
 *  execCommand: deprecated but universally supported, and this only runs
 *  inside the admin CMS, never on the public site. Output is plain HTML
 *  (<b>/<i>/<u>), matching what the site's dangerouslySetInnerHTML
 *  renderers already expect. */
export default function RichTextEditor({
  value,
  onChange,
  rows = 3,
  allowHighlight = false,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  rows?: number;
  allowHighlight?: boolean;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Tracks the last HTML this editor itself produced, so the effect below
  // can tell "the parent echoed my own edit back" (skip — touching the DOM
  // mid-typing resets the cursor to the start) apart from "the parent swapped
  // in different content, e.g. switched records" (apply it).
  const lastValue = useRef<string | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (value !== lastValue.current) el.innerHTML = value || "";
    lastValue.current = value;
  }, [value]);

  const sync = () => {
    const html = ref.current?.innerHTML || "";
    lastValue.current = html;
    onChange(html);
  };

  const exec = (cmd: string) => {
    ref.current?.focus();
    document.execCommand(cmd);
    sync();
  };

  const highlight = () => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    const text = sel?.toString();
    if (!sel || !text) return;
    document.execCommand("insertHTML", false, `<span class="m">${text}</span>`);
    sync();
  };

  return (
    <div className="rte">
      <div className="rte-toolbar">
        <button type="button" title="Bold" onMouseDown={(e) => { e.preventDefault(); exec("bold"); }}>{icBold}</button>
        <button type="button" title="Italic" onMouseDown={(e) => { e.preventDefault(); exec("italic"); }}>{icItalic}</button>
        <button type="button" title="Underline" onMouseDown={(e) => { e.preventDefault(); exec("underline"); }}>{icUnderline}</button>
        {allowHighlight && (
          <button type="button" title="Highlight selection as a metric" className="rte-highlight" onMouseDown={(e) => { e.preventDefault(); highlight(); }}>Metric</button>
        )}
        <span className="rte-sep" />
        <button type="button" title="Undo" onMouseDown={(e) => { e.preventDefault(); exec("undo"); }}>{icUndo}</button>
        <button type="button" title="Redo" onMouseDown={(e) => { e.preventDefault(); exec("redo"); }}>{icRedo}</button>
      </div>
      <div
        ref={ref}
        className="rte-body"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        style={{ minHeight: `${rows * 22}px` }}
        onInput={sync}
        onBlur={sync}
      />
    </div>
  );
}
