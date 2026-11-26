import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { AppText } from '@/components/AppText';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/Button';
import { joinNames, ListingPhoto, priceLine } from '@/components/lodging/ListingParts';
import { Sticker } from '@/components/Sticker';
import { TextField } from '@/components/TextField';
import { t } from '@/i18n';
import { useAuth } from '@/lib/auth';
import { normalizeUrl } from '@/lib/linkPreview';
import { doneSwiping, fetchListings, removeListing, toSwipe, tripNights, type Listing } from '@/lib/listings';
import { reportError } from '@/lib/report';
import { fetchTrip, useLoad, type Trip } from '@/lib/trips';
import { colors, radius, space, touchTarget } from '@/theme';

/** Every listing proposed for the trip, the field to paste a new one, and the way into the swipe. */
export default function LodgingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const me = session?.user.id ?? '';
  const { data, error, loading, refresh } = useLoad(async () => {
    const [trip, listings] = await Promise.all([fetchTrip(id), fetchListings(id)]);
    return { trip, listings };
  });
  const [link, setLink] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);

  const add = () => {
    const url = normalizeUrl(link);
    if (!url) {
      setLinkError(t('lodging.invalidLink'));
      return;
    }
    setLinkError(null);
    setLink('');
    router.push({ pathname: '/voyage/[id]/logement/ajouter', params: { id, lien: url } });
  };

  if (loading && !data) return <View style={[styles.screen, styles.placeholder]} />;

  const trip = data?.trip;
  if (!trip || !data) {
    return (
      <View style={[styles.screen, styles.missing, { paddingTop: insets.top + space.xxl }]}>
        <AppText>{error ? t('errors.generic') : t('errors.tripNotFound')}</AppText>
        <Button label={t('common.retry')} variant="small" onPress={refresh} />
      </View>
    );
  }

  const { listings } = data;
  const nights = tripNights(trip);
  const people = trip.members.length;
  const left = toSwipe(listings, me).length;
  const swipedSome = listings.length > left;
  const done = doneSwiping(
    listings,
    trip.members.map((m) => m.userId),
  );
  const waiting = trip.members.filter((m) => !done.includes(m.userId) && m.userId !== me).map((m) => m.firstName);
  const isOrganizer = trip.members.some((m) => m.userId === me && m.role === 'organisateur');
  const chosen = listings.find((l) => l.id === trip.chosenListingId);

  const openSwipe = () => router.push({ pathname: '/voyage/[id]/logement/swipe', params: { id } });
  const openVerdict = () => router.push({ pathname: '/voyage/[id]/logement/verdict', params: { id } });

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + space.s, paddingBottom: insets.bottom + space.xl }]}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} />}
    >
      <BackButton />
      <Sticker name="coeur" width={78} tilt={10} style={styles.sticker} />
      <AppText variant="display" accessibilityRole="header" style={styles.title}>
        {t('lodging.sectionTitle')}
      </AppText>
      <AppText color={colors.textMuted} style={styles.subtitle}>
        {t('lodging.subtitle')}
      </AppText>

      {chosen && (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`${t('lodging.chosen')} : ${chosen.title}. ${t('lodging.seeListing')}`}
          onPress={() => Linking.openURL(chosen.url)}
          style={({ pressed }) => [styles.chosen, pressed && styles.pressed]}
        >
          <ListingPhoto listing={chosen} style={styles.thumb} />
          <View style={styles.flex}>
            <AppText variant="caption">{t('lodging.chosen')}</AppText>
            <AppText variant="bodyStrong" numberOfLines={2}>
              {chosen.title}
            </AppText>
            <AppText variant="caption" style={styles.underline}>
              {t('lodging.seeListing')}
            </AppText>
          </View>
        </Pressable>
      )}

      <View style={styles.addBox}>
        <View style={styles.addRow}>
          <View style={styles.flex}>
            <TextField
              label={t('lodging.addLabel')}
              placeholder={t('lodging.addPlaceholder')}
              value={link}
              onChangeText={(text) => {
                setLink(text);
                if (linkError) setLinkError(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              returnKeyType="go"
              onSubmitEditing={add}
              error={linkError}
            />
          </View>
          <Button label={t('lodging.addButton')} variant="small" onPress={add} disabled={!link.trim()} style={styles.addButton} />
        </View>
        <AppText variant="caption" color={colors.textMuted}>
          {t('lodging.addHint')}
        </AppText>
      </View>

      {listings.length > 0 && (
        <>
          <View style={styles.status}>
            <AppText variant="bodyStrong">
              {listings.length === 1 ? t('lodging.countOne') : t('lodging.count', { count: listings.length })}
            </AppText>
            <AppText variant="caption" color={colors.textMuted}>
              {t('lodging.swiped', { count: done.length, total: people })}
            </AppText>
          </View>
          <View style={styles.list}>
            {listings.map((listing) => (
              <ListingRow
                key={listing.id}
                listing={listing}
                trip={trip}
                me={me}
                nights={nights}
                canRemove={listing.addedBy === me || isOrganizer}
                onRemoved={refresh}
              />
            ))}
          </View>

          <View style={styles.footer}>
            {left === 0 && waiting.length > 0 && (
              <AppText style={styles.waiting}>{t('lodging.waitingOthers', { names: joinNames(waiting) })}</AppText>
            )}
            {left > 0 ? (
              <Button label={swipedSome ? t('lodging.continueSwipe') : t('lodging.startSwipe')} onPress={openSwipe} />
            ) : (
              <Button label={t('lodging.seeVerdict')} onPress={openVerdict} />
            )}
            {left > 0 && swipedSome && <Button label={t('lodging.seeVerdict')} variant="link" onPress={openVerdict} />}
          </View>
        </>
      )}
    </ScrollView>
  );
}

function ListingRow({
  listing,
  trip,
  me,
  nights,
  canRemove,
  onRemoved,
}: {
  listing: Listing;
  trip: Trip;
  me: string;
  nights: number | null;
  canRemove: boolean;
  onRemoved: () => void;
}) {
  const author = listing.addedBy === me ? t('lodging.byYou') : t('lodging.by', { name: trip.members.find((m) => m.userId === listing.addedBy)?.firstName ?? '?' });
  const line = [priceLine(listing, nights, trip.members.length), author].filter(Boolean).join(' · ');

  const confirmRemove = () =>
    Alert.alert(t('lodging.removeTitle'), listing.title, [
      { text: t('lodging.cancel'), style: 'cancel' },
      {
        text: t('lodging.removeConfirm'),
        style: 'destructive',
        onPress: async () => {
          try {
            await removeListing(listing.id);
          } catch (e) {
            reportError('removeListing', e);
            Alert.alert(t('errors.generic'));
          }
          onRemoved();
        },
      },
    ]);

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`${listing.title}, ${line}. ${t('lodging.seeListing')}`}
        onPress={() => Linking.openURL(listing.url)}
        style={({ pressed }) => [styles.rowMain, pressed && styles.pressed]}
      >
        <ListingPhoto listing={listing} style={styles.thumb} />
        <View style={styles.flex}>
          <AppText variant="bodyStrong" numberOfLines={2} style={styles.rowTitle}>
            {listing.title}
          </AppText>
          <AppText variant="caption" color={colors.textMuted}>
            {line}
          </AppText>
        </View>
      </Pressable>
      {canRemove && (
        <Pressable accessibilityRole="button" accessibilityLabel={`${t('lodging.remove')} : ${listing.title}`} onPress={confirmRemove} style={styles.remove}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth={2.2} strokeLinecap="round">
            <Path d="M18 6 6 18" />
            <Path d="m6 6 12 12" />
          </Svg>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  placeholder: { backgroundColor: colors.surface },
  missing: { paddingHorizontal: space.xl, gap: space.l, alignItems: 'flex-start' },
  content: { flexGrow: 1, paddingHorizontal: space.xl - 4 },
  sticker: { position: 'absolute', right: space.xl, top: 58 },
  title: { marginTop: space.l, maxWidth: 260 },
  subtitle: { marginTop: space.s },
  chosen: {
    marginTop: space.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.m,
    padding: space.m,
    borderRadius: radius.m,
    backgroundColor: colors.limeTint,
  },
  underline: { textDecorationLine: 'underline' },
  addBox: { marginTop: space.xl, padding: space.l, borderRadius: radius.m, backgroundColor: colors.skyTint, gap: space.s },
  addRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.s },
  addButton: { height: 56, marginTop: 26 },
  status: { marginTop: space.xl, gap: 2 },
  list: { marginTop: space.m, gap: space.s },
  row: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.m, backgroundColor: colors.surface },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.m, padding: space.s },
  rowTitle: { fontSize: 15, lineHeight: 20 },
  thumb: { width: 64, height: 64, borderRadius: radius.s },
  remove: { width: touchTarget, height: touchTarget, alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  flex: { flex: 1, gap: 2 },
  pressed: { opacity: 0.85 },
  footer: { marginTop: 'auto', paddingTop: space.xl, gap: space.s },
  waiting: { fontSize: 15, lineHeight: 21, textAlign: 'center' },
});
