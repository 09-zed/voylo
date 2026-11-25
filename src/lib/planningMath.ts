// Pure calculations on the group's answers (no network), kept apart so they can be tested.
import type { Planning } from './planning';

/** How many people are free on each day. */
export function countByDay(planning: Planning) {
  const counts = new Map<string, number>();
  for (const answers of planning.values()) {
    for (const day of answers.days) counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  return counts;
}

export type DateRange = { start: string; end: string; available: number; length: number };

function nextDay(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + 1));
  return date.toISOString().slice(0, 10);
}

/** Runs of consecutive days where at least `level` people are free. */
function runsAtLevel(counts: Map<string, number>, level: number): DateRange[] {
  const days = [...counts.keys()].filter((d) => (counts.get(d) ?? 0) >= level).sort();
  const runs: DateRange[] = [];
  for (const day of days) {
    const last = runs.at(-1);
    if (last && nextDay(last.end) === day) {
      last.end = day;
      last.length += 1;
    } else {
      runs.push({ start: day, end: day, available: level, length: 1 });
    }
  }
  return runs;
}

/**
 * The best stretches of days for the group: as many people as possible first,
 * then the longest stretch, then the soonest. Never more than `limit`, and
 * never a stretch where fewer than `minAvailable` people are free.
 */
export function bestRanges(counts: Map<string, number>, limit = 3, minAvailable = 1): DateRange[] {
  const max = Math.max(0, ...counts.values());
  const picked: DateRange[] = [];
  for (let level = max; level >= Math.max(1, minAvailable) && picked.length < limit; level--) {
    // A lower level can offer a longer stretch around a better one: keep those,
    // but skip stretches that sit entirely inside one already picked.
    const candidates = runsAtLevel(counts, level)
      .filter((run) => !picked.some((p) => run.start >= p.start && run.end <= p.end))
      .sort((a, b) => b.length - a.length || a.start.localeCompare(b.start));
    for (const run of candidates) {
      if (picked.length < limit) picked.push(run);
    }
  }
  return picked;
}

/** The budget everyone can afford, or the full spread when there isn't one. */
export function groupBudget(planning: Planning) {
  const ranges = [...planning.values()].filter((a) => a.budgetMin !== null);
  if (ranges.length === 0) return null;
  const mins = ranges.map((a) => a.budgetMin ?? 0);
  const maxes = ranges.map((a) => a.budgetMax ?? Infinity);
  const commonMin = Math.max(...mins);
  const commonMax = Math.min(...maxes);
  return {
    answered: ranges.length,
    common: commonMin <= commonMax,
    min: commonMin <= commonMax ? commonMin : Math.min(...mins),
    max: commonMin <= commonMax ? commonMax : Math.max(...maxes),
  };
}
