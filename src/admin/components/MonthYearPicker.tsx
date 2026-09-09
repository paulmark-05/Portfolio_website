import { useEffect, useState } from "react";

/**
 * Month-Year picker. Emits a value as "YYYY-MM" (or "" when cleared) so it is
 * easy to store and to format. Holds month/year independently so a user can
 * pick them in any order without the partial selection being wiped.
 */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function MonthYearPicker({
  value,
  onChange,
  disabled,
}: {
  value: string; // "YYYY-MM" or ""
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const [vy, vm] = value ? value.split("-") : ["", ""];
  const [month, setMonth] = useState(vm || "");
  const [year, setYear] = useState(vy || "");

  // keep internal state in sync when the row being edited changes
  useEffect(() => {
    const [ny, nm] = value ? value.split("-") : ["", ""];
    setYear(ny || "");
    setMonth(nm || "");
  }, [value]);

  const now = new Date().getFullYear();
  const years = Array.from({ length: 16 }, (_, i) => String(now + 1 - i));

  const commit = (mm: string, yy: string) => {
    // only emit a combined value when BOTH are present; otherwise emit ""
    onChange(mm && yy ? `${yy}-${mm}` : "");
  };

  return (
    <div className="my-picker">
      <select disabled={disabled} value={month} onChange={(e) => { setMonth(e.target.value); commit(e.target.value, year); }}>
        <option value="">Month</option>
        {MONTHS.map((label, i) => (
          <option key={label} value={String(i + 1).padStart(2, "0")}>{label}</option>
        ))}
      </select>
      <select disabled={disabled} value={year} onChange={(e) => { setYear(e.target.value); commit(month, e.target.value); }}>
        <option value="">Year</option>
        {years.map((yy) => <option key={yy} value={yy}>{yy}</option>)}
      </select>
    </div>
  );
}

/** "2026-04" -> "Apr 2026"; "" -> "". */
export function formatMonthYear(v: string): string {
  if (!v) return "";
  const [yy, mm] = v.split("-");
  const idx = Number(mm) - 1;
  if (idx < 0 || idx > 11) return v;
  return `${MONTHS[idx]} ${yy}`;
}

/** Build a duration/date label from a start, optional end, and "current" flag. */
export function formatRange(start: string, end: string, current: boolean): string {
  const s = formatMonthYear(start);
  if (!s) return "";
  if (current) return `${s} to Present`;
  const e = formatMonthYear(end);
  return e ? `${s} to ${e}` : s;
}

/** Parse a stored display label ("Apr 2026", "Jul 2025 — Present · Kolkata")
 *  back into a "YYYY-MM" value so existing rows populate the pickers. */
export function parseToValue(label: string): string {
  if (!label) return "";
  const m = label.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\b/);
  if (!m) return "";
  const idx = MONTHS.indexOf(m[1]) + 1;
  return `${m[2]}-${String(idx).padStart(2, "0")}`;
}
