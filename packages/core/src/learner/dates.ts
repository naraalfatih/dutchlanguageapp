const DAY_MS = 86_400_000;

/** UTC calendar day key (YYYY-MM-DD). Server and client agree on UTC days. */
export function dayKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}

export function daysBetween(a: Date | string, b: Date | string): number {
  const ta = typeof a === 'string' ? new Date(a).getTime() : a.getTime();
  const tb = typeof b === 'string' ? new Date(b).getTime() : b.getTime();
  return (tb - ta) / DAY_MS;
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

/** Keep only day keys within `keepDays` before `reference`. */
export function pruneDays<T>(record: Record<string, T>, reference: Date | string, keepDays: number): Record<string, T> {
  const cutoff = dayKey(addDays(typeof reference === 'string' ? new Date(reference) : reference, -keepDays));
  const result: Record<string, T> = {};
  for (const [key, value] of Object.entries(record)) {
    if (key >= cutoff) result[key] = value;
  }
  return result;
}

/** Sum values of a day-keyed record for days in [now - toDaysAgo, now - fromDaysAgo). */
export function sumWindow(record: Record<string, number>, now: Date, fromDaysAgo: number, toDaysAgo: number): number {
  const newest = dayKey(addDays(now, -fromDaysAgo));
  const oldest = dayKey(addDays(now, -toDaysAgo));
  let total = 0;
  for (const [key, value] of Object.entries(record)) {
    if (key > oldest && key <= newest) total += value;
  }
  return total;
}
