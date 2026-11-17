/** Small formatting helpers that reproduce PHP `date()` / `number_format()` output. */

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** Matches PHP `number_format($value)` (no decimals, comma grouping). */
export function formatNumber(value: number | bigint | null | undefined): string {
  return Number(value ?? 0).toLocaleString("en-US");
}

/** `M d, Y` — e.g. `Nov 18, 2026` */
export function formatDate(value: Date | null | undefined): string {
  if (!value) return "";
  return `${MONTHS_SHORT[value.getMonth()]} ${pad(value.getDate())}, ${value.getFullYear()}`;
}

/** `M d, Y H:i` — e.g. `Nov 18, 2026 14:30` */
export function formatDateTime(value: Date | null | undefined): string {
  if (!value) return "";
  return `${formatDate(value)} ${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

/** `M d, Y H:i:s` */
export function formatDateTimeSeconds(value: Date | null | undefined): string {
  if (!value) return "";
  return `${formatDateTime(value)}:${pad(value.getSeconds())}`;
}

/** `M d, H:i` — used by the dashboard authentication table. */
export function formatShortDateTime(value: Date | null | undefined): string {
  if (!value) return "";
  return `${MONTHS_SHORT[value.getMonth()]} ${pad(value.getDate())}, ${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

/** `M d H:i:s` — used by the visitor analytics detail log. */
export function formatVisitTime(value: Date | null | undefined): string {
  if (!value) return "";
  return `${MONTHS_SHORT[value.getMonth()]} ${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;
}

/** `F d, Y \a\t H:i` — e.g. `November 18, 2026 at 14:30` */
export function formatLongDateTime(value: Date | null | undefined): string {
  if (!value) return "";
  return `${MONTHS_LONG[value.getMonth()]} ${pad(value.getDate())}, ${value.getFullYear()} at ${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

/** `F Y` — e.g. `November 2026` */
export function formatMonthYear(value: Date | null | undefined): string {
  if (!value) return "";
  return `${MONTHS_LONG[value.getMonth()]} ${value.getFullYear()}`;
}

/** `M d` — chart labels. */
export function formatChartDate(value: Date): string {
  return `${MONTHS_SHORT[value.getMonth()]} ${pad(value.getDate())}`;
}

/** `D, M d` — dashboard 7-day chart labels. */
export function formatDailyChartDate(value: Date): string {
  return `${DAYS_SHORT[value.getDay()]}, ${MONTHS_SHORT[value.getMonth()]} ${pad(value.getDate())}`;
}

/** `M Y` — dashboard monthly chart labels. */
export function formatMonthLabel(value: Date): string {
  return `${MONTHS_SHORT[value.getMonth()]} ${value.getFullYear()}`;
}

/** `ucwords(str_replace('_', ' ', $value))` — e.g. `cash_on_delivery` → `Cash On Delivery` */
export function displayPaymentMethod(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

/** Shortens a hash/session id the same way the analytics pages do. */
export function shortHash(value: string): string {
  if (!value) return "";
  return value.length > 12 ? `${value.slice(0, 12)}...` : value;
}
