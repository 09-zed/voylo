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
