/** Initials for a person's name, e.g. "Nayani Paul" -> "NP". */
export function initialsOf(name: string): string {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts[parts.length - 1][0] || "")).toUpperCase();
}

/** Initials for a company/org name, e.g. "Cipher Chain Capital" -> "CC". */
export function initialsOfOrg(name: string): string {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return parts.slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

const ORG_PALETTE = ["#7C9C7E", "#C08A5C", "#6E93C4", "#C4738A", "#9587C4", "#5FA88F", "#CC9A5C", "#5FA0AD"];

/** Deterministic accent color for a company/org badge, stable across renders. */
export function colorForOrg(name: string): string {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return ORG_PALETTE[h % ORG_PALETTE.length];
}

/** Strip a profile URL down to its handle for compact display, e.g.
 *  "https://github.com/nayanipaul" -> "nayanipaul". */
export function handleOf(url: string): string {
  if (!url) return "";
  const clean = url.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const parts = clean.split("/");
  return parts[parts.length - 1] || clean;
}
