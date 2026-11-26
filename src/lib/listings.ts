import type { ListingSource } from './linkPreview';
import { supabase } from './supabase';
import type { Trip } from './trips';

export type PriceUnit = 'night' | 'total';

export type Listing = {
  id: string;
  tripId: string;
  addedBy: string;
  url: string;
  source: ListingSource;
  title: string;
  imageUrl: string | null;
  details: string | null;
  priceAmount: number;
  priceUnit: PriceUnit;
  note: string | null;
  likes: string[];
  passes: string[];
};

type ListingRow = {
  id: string;
  trip_id: string;
  added_by: string;
  url: string;
  source: ListingSource;
  title: string;
  image_url: string | null;
  details: string | null;
  price_amount: number | string;
  price_unit: PriceUnit;
  note: string | null;
  created_at: string;
  listing_swipes: { user_id: string; liked: boolean }[];
};

export async function fetchListings(tripId: string): Promise<Listing[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('id, trip_id, added_by, url, source, title, image_url, details, price_amount, price_unit, note, created_at, listing_swipes(user_id, liked)')
    .eq('trip_id', tripId)
    .order('created_at')
    .returns<ListingRow[]>();
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    tripId: row.trip_id,
    addedBy: row.added_by,
    url: row.url,
    source: row.source,
    title: row.title,
    imageUrl: row.image_url,
    details: row.details,
    priceAmount: Number(row.price_amount),
    priceUnit: row.price_unit,
    note: row.note,
    likes: row.listing_swipes.filter((s) => s.liked).map((s) => s.user_id),
    passes: row.listing_swipes.filter((s) => !s.liked).map((s) => s.user_id),
  }));
}

export async function addListing(input: {
  tripId: string;
  addedBy: string;
  url: string;
  urlKey: string;
  source: ListingSource;
  title: string;
  imageUrl: string | null;
  details: string | null;
  priceAmount: number;
  priceUnit: PriceUnit;
  note: string | null;
}) {
  const { error } = await supabase.from('listings').insert({
    trip_id: input.tripId,
    added_by: input.addedBy,
    url: input.url,
    url_key: input.urlKey,
    source: input.source,
    title: input.title,
    image_url: input.imageUrl,
    details: input.details,
    price_amount: input.priceAmount,
    price_unit: input.priceUnit,
    note: input.note,
  });
  if (error) throw error;
}

/** The listing already proposed in this trip with the same link, if any. */
export async function findListingByKey(tripId: string, urlKey: string) {
  const { data, error } = await supabase
    .from('listings')
    .select('id, title')
    .eq('trip_id', tripId)
    .eq('url_key', urlKey)
    .maybeSingle<{ id: string; title: string }>();
  if (error) throw error;
  return data;
}

/** True when the insert hit the "same listing twice in one trip" rule. */
export function isDuplicateError(error: unknown) {
  return typeof error === 'object' && error !== null && (error as { code?: string }).code === '23505';
}

/** Members who have swiped every listing. */
export function doneSwiping(listings: Listing[], memberIds: string[]) {
  if (listings.length === 0) return [];
  return memberIds.filter((id) => listings.every((l) => l.likes.includes(id) || l.passes.includes(id)));
}

/** Listings this person hasn't swiped yet, oldest first. */
export function toSwipe(listings: Listing[], userId: string) {
  return listings.filter((l) => !l.likes.includes(userId) && !l.passes.includes(userId));
}

export async function removeListing(id: string) {
  const { error } = await supabase.from('listings').delete().eq('id', id);
  if (error) throw error;
}

export async function swipeListing(listingId: string, userId: string, liked: boolean) {
  const { error } = await supabase
    .from('listing_swipes')
    .upsert({ listing_id: listingId, user_id: userId, liked }, { onConflict: 'listing_id,user_id' });
  if (error) throw error;
}

export async function undoSwipe(listingId: string, userId: string) {
  const { error } = await supabase.from('listing_swipes').delete().eq('listing_id', listingId).eq('user_id', userId);
  if (error) throw error;
}

export async function chooseListing(tripId: string, listingId: string | null) {
  const { error } = await supabase.rpc('choose_listing', { target_trip: tripId, target_listing: listingId });
  if (error) throw error;
}

/** Nights of the trip, when both dates are known. */
export function tripNights(trip: Trip) {
  if (!trip.startDate || !trip.endDate) return null;
  const [y1, m1, d1] = trip.startDate.split('-').map(Number);
  const [y2, m2, d2] = trip.endDate.split('-').map(Number);
  const nights = Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000);
  return nights > 0 ? nights : null;
}

/** Per night, for the whole stay, and per person. Null where the dates don't allow it. */
export function listingPrices(listing: Pick<Listing, 'priceAmount' | 'priceUnit'>, nights: number | null, people: number) {
  const perNight = listing.priceUnit === 'night' ? listing.priceAmount : nights ? listing.priceAmount / nights : null;
  const total = listing.priceUnit === 'total' ? listing.priceAmount : nights ? listing.priceAmount * nights : null;
  const perPerson = total !== null && people > 0 ? total / people : null;
  return { perNight, total, perPerson };
}

/** Most liked first; ties broken by fewest "no", then the oldest. */
export function rankListings(listings: Listing[]) {
  return [...listings].sort((a, b) => b.likes.length - a.likes.length || a.passes.length - b.passes.length);
}
