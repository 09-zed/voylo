// Reads what it can from a listing link (Airbnb, Booking or any site).
// It runs on the phone, like a messaging app building a link preview:
// one page, read once, only when someone pastes a link.
// Tested on 25 Nov 2026: Airbnb gives photo, title and details; Booking blocks
// automated reads, so the hotel name is taken from the link itself.

export type ListingSource = 'airbnb' | 'booking' | 'autre';

export type LinkPreview = {
  url: string;
  /** Identifies the listing regardless of tracking parameters, to spot duplicates. */
  urlKey: string;
  source: ListingSource;
  title: string | null;
  imageUrl: string | null;
  details: string | null;
};

const TIMEOUT_MS = 8000;
const MAX_HTML = 600_000;

export function normalizeUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    return url.hostname.includes('.') ? url.toString() : null;
  } catch {
    return null;
  }
}

function sourceOf(url: URL): ListingSource {
  if (/(^|\.)airbnb\./.test(url.hostname)) return 'airbnb';
  if (/(^|\.)booking\.com$/.test(url.hostname)) return 'booking';
  return 'autre';
}

function keyOf(url: URL, source: ListingSource) {
  if (source === 'airbnb') {
    const room = /\/rooms\/(\d+)/.exec(url.pathname);
    if (room) return `airbnb:${room[1]}`;
  }
  if (source === 'booking') {
    const hotel = /\/hotel\/([a-z]{2})\/([^./]+)/.exec(url.pathname);
    if (hotel) return `booking:${hotel[1]}/${hotel[2]}`;
  }
  return `${url.hostname.replace(/^www\./, '')}${url.pathname.replace(/\/$/, '')}`.toLowerCase();
}

/** "the-hoxton-amsterdam" → "The Hoxton Amsterdam" */
function nameFromBookingPath(url: URL) {
  const hotel = /\/hotel\/[a-z]{2}\/([^./]+)/.exec(url.pathname);
  if (!hotel) return null;
  return hotel[1]
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function decode(text: string) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, '’')
    .replace(/&apos;/g, '’')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;| /g, ' ')
    .trim();
}

function meta(html: string, property: string) {
  const escaped = property.replace(':', '\\:');
  const a = new RegExp(`<meta[^>]+(?:property|name)="${escaped}"[^>]+content="([^"]*)"`, 'i').exec(html);
  const b = new RegExp(`<meta[^>]+content="([^"]*)"[^>]+(?:property|name)="${escaped}"`, 'i').exec(html);
  const value = (a ?? b)?.[1];
  return value ? decode(value) : null;
}

/** Airbnb titles look like "Hotel name · ★4,76 · Hôtel · Amsterdam" or "Loft · Amsterdam · ★4,9 · 1 chambre". */
function splitAirbnbTitle(title: string) {
  const parts = title.split(' · ').map((p) => p.trim()).filter(Boolean);
  const nameParts = [parts[0]];
  if (parts[1] && !parts[1].startsWith('★')) nameParts.push(parts[1]);
  return {
    title: nameParts.join(' · '),
    details: parts.slice(nameParts.length).join(' · ') || null,
  };
}

export async function readListingLink(input: string): Promise<LinkPreview | null> {
  const normalized = normalizeUrl(input);
  if (!normalized) return null;

  let finalUrl = new URL(normalized);
  let html = '';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(normalized, {
      signal: controller.signal,
      headers: { 'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.6' },
    });
    // Short "share" links redirect to the real listing: keep where we landed.
    if (response.url) finalUrl = new URL(response.url);
    if (response.ok) html = (await response.text()).slice(0, MAX_HTML);
  } catch {
    // Offline, blocked or too slow: fall back to what the link itself says.
  } finally {
    clearTimeout(timer);
  }

  const source = sourceOf(finalUrl);
  const ogTitle = meta(html, 'og:title') ?? (/<title>([^<]*)<\/title>/i.exec(html)?.[1] ? decode(/<title>([^<]*)<\/title>/i.exec(html)![1]) : null);
  const imageUrl = meta(html, 'og:image');
  const description = meta(html, 'og:description');

  let title: string | null = ogTitle;
  let details: string | null = null;
  if (source === 'airbnb' && ogTitle) {
    ({ title, details } = splitAirbnbTitle(ogTitle));
  } else if (source === 'booking') {
    title = ogTitle ?? nameFromBookingPath(finalUrl);
  }
  if (!details && description) details = description.slice(0, 120);

  return {
    url: finalUrl.toString(),
    urlKey: keyOf(finalUrl, source),
    source,
    title: title ? title.slice(0, 120) : null,
    imageUrl: imageUrl && imageUrl.startsWith('https://') ? imageUrl : null,
    details: details ? details.slice(0, 200) : null,
  };
}
