import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { AvatarStack } from '@/components/AvatarStack';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/Button';
import { ListingPhoto, priceLine } from '@/components/lodging/ListingParts';
import { Sticker } from '@/components/Sticker';
import { t } from '@/i18n';
import { useAuth } from '@/lib/auth';
import { formatEuros } from '@/lib/dates';
import { chooseListing, doneSwiping, fetchListings, listingPrices, rankListings, tripNights, type Listing } from '@/lib/listings';
import { reportError } from '@/lib/report';
import { fetchTrip, useLoad, type Trip } from '@/lib/trips';
import { colors, fonts, radius, space } from '@/theme';

export default function VerdictScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const me = session?.user.id ?? '';
  const { data, error, loading, refresh } = useLoad(async () => {
    const [trip, listings] = await Promise.all([fetchTrip(id), fetchListings(id)]);
    return { trip, listings };
  });
  const [showRanking, setShowRanking] = useState(false);

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

  const ranked = rankListings(data.listings);
  const winner = ranked[0];
  const people = trip.members.length;
  const isMatch = people > 1 && !!winner && winner.likes.length === people;

  if (isMatch && !showRanking) {
    return <Match trip={trip} listing={winner} me={me} onChanged={refresh} onShowRanking={() => setShowRanking(true)} />;
  }

  return <Ranking trip={trip} ranked={ranked} me={me} onChanged={refresh} />;
}

function Ranking({ trip, ranked, me, onChanged }: { trip: Trip; ranked: Listing[]; me: string; onChanged: () => void }) {
  const insets = useSafeAreaInsets();
  const people = trip.members.length;
  const nights = tripNights(trip);
  const done = doneSwiping(
    ranked,
    trip.members.map((m) => m.userId),
  ).length;
  const isOrganizer = trip.members.some((m) => m.userId === me && m.role === 'organisateur');
  const [picked, setPicked] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  const winner = ranked[0];
  const selected = picked ?? trip.chosenListingId ?? winner?.id ?? null;
  const tie = ranked.length > 1 && ranked[0].likes.length > 0 && ranked[0].likes.length === ranked[1].likes.length;

  const validate = async () => {
    if (!selected) return;
    setSaving(true);
    setFailed(false);
    try {
      await chooseListing(trip.id, selected);
      onChanged();
    } catch (e) {
      reportError('chooseListing', e);
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + space.s, paddingBottom: insets.bottom + space.xl }]}
      refreshControl={<RefreshControl refreshing={false} onRefresh={onChanged} />}
    >
      <BackButton />
      <AppText variant="display" accessibilityRole="header" style={styles.title}>
        {t('lodging.verdictTitle')}
      </AppText>
      <AppText color={colors.textMuted} style={styles.subtitle}>
        {t('lodging.verdictSwiped', { count: done, total: people })}
      </AppText>

      <View style={styles.list} accessibilityRole={isOrganizer ? 'radiogroup' : undefined}>
        {ranked.map((listing, i) => {
          const likers = trip.members.filter((m) => listing.likes.includes(m.userId));
          const isSelected = isOrganizer && listing.id === selected;
          const isChosen = listing.id === trip.chosenListingId;
          const first = i === 0;
          const share = people > 0 ? listing.likes.length / people : 0;
          const line =
            listing.likes.length === people && people > 1
              ? [t('lodging.everyoneLiked'), perPersonText(listing, nights, people)].filter(Boolean).join(' · ')
              : priceLine(listing, nights, people);

          return (
            <Pressable
              key={listing.id}
              accessibilityRole={isOrganizer ? 'radio' : undefined}
              accessibilityState={isOrganizer ? { checked: isSelected } : undefined}
              accessibilityLabel={`${listing.title}, ${listing.likes.length}/${people}. ${line}${isChosen ? `. ${t('lodging.validated')}` : ''}`}
              disabled={!isOrganizer}
              onPress={() => setPicked(listing.id)}
              style={[styles.item, first && styles.first, isSelected && styles.selected]}
            >
              {first && (
                <View style={styles.badge}>
                  <AppText variant="caption">{isChosen ? t('lodging.validated') : t('lodging.groupChoice')}</AppText>
                </View>
              )}
              <View style={styles.itemRow}>
                <ListingPhoto listing={listing} style={first ? styles.bigThumb : styles.thumb} />
                <View style={styles.flex}>
                  <AppText style={first ? styles.firstTitle : styles.itemTitle} numberOfLines={2}>
                    {listing.title}
                  </AppText>
                  {!first && isChosen && <AppText variant="caption">{t('lodging.validated')}</AppText>}
                </View>
                <AppText style={styles.score}>{`${listing.likes.length}/${people}`}</AppText>
              </View>
              <View style={styles.bar}>
                <View style={[styles.barFill, { width: `${Math.round(share * 100)}%`, backgroundColor: first ? colors.lime : colors.sky }]} />
              </View>
              <View style={styles.itemFoot}>
                {likers.length > 0 && <AvatarStack members={likers.map((m) => ({ id: m.userId, name: m.firstName, color: m.color }))} size={26} />}
                <AppText variant="caption" color={colors.textMuted} style={styles.flex}>
                  {line}
                </AppText>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        {tie && (
          <AppText variant="caption" color={colors.textMuted} style={styles.center}>
            {t('lodging.tie')}
          </AppText>
        )}
        {failed && (
          <AppText variant="caption" color={colors.error} style={styles.center} accessibilityRole="alert">
            {t('errors.generic')}
          </AppText>
        )}
        {isOrganizer ? (
          <Button
            label={selected && selected === trip.chosenListingId ? `${t('lodging.validated')} ✓` : t('lodging.validate')}
            onPress={validate}
            loading={saving}
            disabled={!selected || selected === trip.chosenListingId}
          />
        ) : (
          <AppText variant="caption" color={colors.textMuted} style={styles.center}>
            {t('lodging.organizersOnly')}
          </AppText>
        )}
      </View>
    </ScrollView>
  );
}

function perPersonText(listing: Listing, nights: number | null, people: number) {
  const { perPerson } = listingPrices(listing, nights, people);
  return perPerson !== null ? t('lodging.perPerson', { price: formatEuros(perPerson) }) : '';
}

/** Everyone liked the same place. */
function Match({ trip, listing, me, onChanged, onShowRanking }: { trip: Trip; listing: Listing; me: string; onChanged: () => void; onShowRanking: () => void }) {
  const insets = useSafeAreaInsets();
  const isOrganizer = trip.members.some((m) => m.userId === me && m.role === 'organisateur');
  const chosen = trip.chosenListingId === listing.id;
  const [saving, setSaving] = useState(false);
  const price = priceLine(listing, tripNights(trip), trip.members.length);

  const validate = async () => {
    setSaving(true);
    try {
      await chooseListing(trip.id, listing.id);
      onChanged();
    } catch (e) {
      reportError('chooseListing', e);
    } finally {
      setSaving(false);
    }
  };

  const backToTrip = () => router.dismissTo({ pathname: '/voyage/[id]', params: { id: trip.id } });

  return (
    <ScrollView style={[styles.screen, styles.lime]} contentContainerStyle={[styles.matchContent, { paddingTop: insets.top + space.s, paddingBottom: insets.bottom + space.l }]}>
      <BackButton />
      <Sticker name="eclat" width={92} tilt={12} style={styles.burst} />
      <AppText style={styles.matchTitle} accessibilityRole="header">
        {t('lodging.matchTitle')}
      </AppText>
      <AppText style={styles.matchText}>{t('lodging.matchText')}</AppText>

      <View style={styles.polaroid}>
        <ListingPhoto listing={listing} big style={styles.polaroidPhoto} />
        <AppText style={styles.polaroidTitle} numberOfLines={2}>
          {listing.title}
        </AppText>
        {price ? <AppText variant="caption">{price}</AppText> : null}
        <Sticker name="coeur" width={64} tilt={-14} style={styles.heart} />
      </View>

      <View style={styles.matchFooter}>
        {isOrganizer && !chosen ? (
          <Button label={t('lodging.validate')} onPress={validate} loading={saving} />
        ) : (
          <Button label={t('lodging.book')} onPress={() => Linking.openURL(listing.url)} />
        )}
        {isOrganizer && !chosen ? (
          <Button label={t('lodging.book')} variant="link" onPress={() => Linking.openURL(listing.url)} />
        ) : (
          <Button label={t('lodging.backToTrip')} variant="link" onPress={backToTrip} />
        )}
        <Button label={t('lodging.verdictTitle')} variant="link" onPress={onShowRanking} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  placeholder: { backgroundColor: colors.surface },
  missing: { paddingHorizontal: space.xl, gap: space.l, alignItems: 'flex-start' },
  content: { flexGrow: 1, paddingHorizontal: space.xl - 4 },
  title: { marginTop: space.l },
  subtitle: { marginTop: space.s },
  list: { marginTop: space.xl, gap: space.m },
  item: { borderRadius: radius.m, padding: space.m, backgroundColor: colors.surface, gap: space.s, borderWidth: 2, borderColor: 'transparent' },
  first: { backgroundColor: colors.white, borderColor: colors.black, paddingTop: space.l },
  selected: { borderColor: colors.black, backgroundColor: colors.limeTint },
  badge: {
    position: 'absolute',
    top: -12,
    left: space.m,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.lime,
    borderWidth: 2,
    borderColor: colors.black,
  },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: space.m },
  thumb: { width: 52, height: 52, borderRadius: radius.s },
  bigThumb: { width: 84, height: 84, borderRadius: radius.s },
  firstTitle: { fontFamily: fonts.display, fontSize: 19, lineHeight: 24 },
  itemTitle: { fontFamily: fonts.bodyStrong, fontSize: 15, lineHeight: 20 },
  score: { fontFamily: fonts.display, fontSize: 18 },
  bar: { height: 8, borderRadius: 4, backgroundColor: colors.white, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  itemFoot: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  flex: { flex: 1 },
  footer: { marginTop: 'auto', paddingTop: space.xl, gap: space.s },
  center: { textAlign: 'center' },
  lime: { backgroundColor: colors.lime },
  matchContent: { flexGrow: 1, paddingHorizontal: space.xl },
  burst: { position: 'absolute', right: space.xl, top: 60 },
  matchTitle: { fontFamily: fonts.display, fontSize: 44, lineHeight: 48, letterSpacing: -0.8, marginTop: space.xl, maxWidth: 260 },
  matchText: { fontSize: 17, lineHeight: 25, marginTop: space.s, maxWidth: 300 },
  polaroid: {
    marginTop: space.xl,
    alignSelf: 'center',
    width: '86%',
    padding: space.m,
    paddingBottom: space.l,
    borderRadius: 6,
    backgroundColor: colors.white,
    gap: 4,
    transform: [{ rotate: '-3deg' }],
    boxShadow: '0 1px 2px rgba(40,60,0,0.16), 0 14px 32px rgba(40,60,0,0.22)',
  },
  polaroidPhoto: { height: 200, borderRadius: 2, marginBottom: space.s },
  polaroidTitle: { fontFamily: fonts.display, fontSize: 19, lineHeight: 24 },
  heart: { position: 'absolute', right: -18, bottom: -22 },
  matchFooter: { marginTop: 'auto', paddingTop: space.xl, gap: 2 },
});
