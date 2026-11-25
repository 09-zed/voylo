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
