import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { t } from '@/i18n';
import { formatEuros } from '@/lib/dates';
import type { ListingSource } from '@/lib/linkPreview';
import { listingPrices, type Listing } from '@/lib/listings';
import { colors, fonts } from '@/theme';
import { AppText } from '../AppText';

const SOURCE_NAMES: Record<ListingSource, string> = { airbnb: 'Airbnb', booking: 'Booking', autre: '' };

/** "Léa, Sami et Inès" */
export function joinNames(names: string[]) {
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} ${t('common.and')} ${names.at(-1)}` : (names[0] ?? '');
}

/** "Airbnb", "Booking", or the site's own name ("hotel-pulitzer.com"). */
export function sourceName(listing: Pick<Listing, 'source' | 'url'>) {
  if (SOURCE_NAMES[listing.source]) return SOURCE_NAMES[listing.source];
  try {
    return new URL(listing.url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/** "138 € / nuit · ≈ 104 € / pers." — what the group needs at a glance. */
export function priceLine(listing: Pick<Listing, 'priceAmount' | 'priceUnit'>, nights: number | null, people: number) {
  const { perNight, total, perPerson } = listingPrices(listing, nights, people);
  const parts: string[] = [];
  if (perNight !== null) parts.push(t('lodging.perNight', { price: formatEuros(perNight) }));
  else if (total !== null) parts.push(t('lodging.total', { price: formatEuros(total) }));
  if (perPerson !== null && people > 1) parts.push(t('lodging.perPerson', { price: formatEuros(perPerson) }));
  return parts.join(' · ');
}

/** The listing's photo, or a sky block with the site's name when it has none. */
export function ListingPhoto({
  listing,
  style,
  big = false,
}: {
  listing: Pick<Listing, 'imageUrl' | 'source' | 'url'>;
  style?: StyleProp<ViewStyle>;
  big?: boolean;
}) {
  return (
    <View style={[styles.photo, style]} accessible={false} importantForAccessibility="no-hide-descendants">
      {listing.imageUrl ? (
        <Image source={{ uri: listing.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
      ) : (
        <AppText style={[styles.placeholder, big && styles.placeholderBig]} numberOfLines={1}>
          {sourceName(listing)}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { backgroundColor: colors.sky, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  placeholder: { fontFamily: fonts.display, fontSize: 11, paddingHorizontal: 4 },
  placeholderBig: { fontSize: 22, paddingHorizontal: 16 },
});
