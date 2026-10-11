export function formatDate(iso: string | null): string {
  if (!iso) return '';
  // ISO date (YYYY-MM-DD). 'en-CA' yields ISO-8601 formatting.
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso));
}

/** "1 post", "3 posts". */
export function countPosts(n: number): string {
  return `${n} ${n === 1 ? 'post' : 'posts'}`;
}

/** A comma-separated tag field as a list of names, blanks dropped. */
export function splitTags(value: string): string[] {
  return value
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);
}

/**
 * Turn the editor's publication-date field (YYYY-MM-DD) into the ISO date-time
 * to store. Moves `originalIso` by whole days so its time of day survives (an
 * unchanged date round-trips exactly, and same-day posts keep their order); with
 * no original it uses local noon. Returns undefined for a blank or malformed date.
 */
export function publishedAtFromDate(
  ymd: string,
  originalIso: string | null,
): string | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return undefined;
  const day = (s: string) => Date.parse(`${s}T00:00:00Z`);
  if (Number.isNaN(day(ymd))) return undefined;

  const original = originalIso ? new Date(originalIso) : null;
  if (!original || Number.isNaN(original.getTime())) {
    return new Date(`${ymd}T12:00:00`).toISOString();
  }
  const shift = day(ymd) - day(formatDate(originalIso));
  return new Date(original.getTime() + shift).toISOString();
}
