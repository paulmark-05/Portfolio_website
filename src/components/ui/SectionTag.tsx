import type { ReactNode } from "react";

/** Small uppercase pill label used above every section — replaces the old
 *  numbered serif headings with a compact, consistent tag. */
export default function SectionTag({ children }: { children: ReactNode }) {
  return <span className="pill-tag reveal">{children}</span>;
}
