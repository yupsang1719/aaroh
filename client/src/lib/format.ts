const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** "2026-10-30" → "30 October 2026". Release dates are calendar dates, so format in UTC. */
export function formatDate(isoDate: string): string {
  return dateFormat.format(new Date(`${isoDate.slice(0, 10)}T00:00:00Z`));
}

export function formatYear(isoDate: string): string {
  return isoDate.slice(0, 4);
}

/** Splits plain text into paragraphs on blank lines. */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
