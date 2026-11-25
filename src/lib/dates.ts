import { locale } from '@/i18n';

/** Parses "YYYY-MM-DD" as a local calendar day (not UTC midnight). */
function parseDay(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Whole days from today until the given day (0 on the day itself). */
export function daysUntil(iso: string, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const ms = parseDay(iso).getTime() - today.getTime();
  return Math.round(ms / 86_400_000);
}

/** "mercredi 30 décembre" / "Wednesday, December 30" */
export function formatDay(iso: string) {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(parseDay(iso));
}

export function formatMoney(amount: number) {
  return new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

/** Formats what people type into "JJ/MM/AAAA" as they go. */
export function maskDateInput(input: string) {
  const digits = input.replace(/\D/g, '').slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
  return parts.join('/');
}

/** "30/12/2026" → "2026-12-30", or null if the day doesn't exist. */
export function parseDateInput(input: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(input);
  if (!match) return null;
  const [, d, m, y] = match.map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return `${match[3]}-${match[2]}-${match[1]}`;
}

/** Local date → "YYYY-MM-DD". */
export function toIso(date: Date) {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

/** "juillet 2027" / "July 2027" */
export function formatMonth(year: number, month: number) {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'fr-FR', { month: 'long', year: 'numeric' }).format(
    new Date(year, month, 1),
  );
}

/** "12 – 16 juillet", "30 déc. – 3 janv." or just "12 juillet" for a single day. */
export function formatRange(startIso: string, endIso: string) {
  const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'fr-FR', opts).format(parseDay(iso));
  if (startIso === endIso) return fmt(startIso, { day: 'numeric', month: 'long' });
  const sameMonth = startIso.slice(0, 7) === endIso.slice(0, 7);
  if (sameMonth) return `${fmt(startIso, { day: 'numeric' })} – ${fmt(endIso, { day: 'numeric', month: 'long' })}`;
  return `${fmt(startIso, { day: 'numeric', month: 'short' })} – ${fmt(endIso, { day: 'numeric', month: 'short' })}`;
}

/** Whole euros, no cents: "450 €". */
export function formatEuros(amount: number) {
  return new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount);
}
