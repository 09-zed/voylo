import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import { doneSwiping, type Listing } from '@/lib/listings';
import type { Trip } from '@/lib/trips';
import { colors, radius, space } from '@/theme';
import { AppText } from '../AppText';
import { Button } from '../Button';
import { ListingPhoto } from '../lodging/ListingParts';
import { Sticker } from '../Sticker';

/** The "Sondages" tab: where the group is on picking the lodging. */
export function LodgingCard({ trip, listings }: { trip: Trip; listings: Listing[] }) {
  const open = () => router.push({ pathname: '/voyage/[id]/logement', params: { id: trip.id } });
  const chosen = listings.find((l) => l.id === trip.chosenListingId) ?? null;
  const done = doneSwiping(
    listings,
    trip.members.map((m) => m.userId),
  ).length;

  return (
    <View style={styles.wrap}>
      {chosen ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${t('lodging.chosen')} : ${chosen.title}`}
          onPress={open}
          style={({ pressed }) => [styles.card, styles.chosen, pressed && styles.pressed]}
        >
          <ListingPhoto listing={chosen} style={styles.thumb} />
          <View style={styles.flex}>
            <AppText variant="caption">{t('lodging.chosen')}</AppText>
            <AppText variant="bodyStrong" numberOfLines={2}>
              {chosen.title}
            </AppText>
          </View>
        </Pressable>
      ) : (
        <View style={[styles.card, styles.column]}>
          <Sticker name="coeur" width={64} tilt={8} style={styles.sticker} />
          <AppText variant="title" style={styles.title}>
            {t('lodging.sectionTitle')}
          </AppText>
          <AppText color={colors.textMuted} style={styles.text}>
            {listings.length === 0
              ? t('lodging.sectionEmpty')
              : `${listings.length === 1 ? t('lodging.countOne') : t('lodging.count', { count: listings.length })} · ${t('lodging.swiped', { count: done, total: trip.members.length })}`}
          </AppText>
          <Button label={t('lodging.open')} variant="small" onPress={open} style={styles.button} />
        </View>
      )}
      <AppText variant="caption" color={colors.textMuted} style={styles.more}>
        {t('lodging.otherPolls')}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.m },
  card: { borderRadius: radius.l, padding: space.l, backgroundColor: colors.surface },
  column: { gap: space.s, paddingTop: space.xl },
  chosen: { backgroundColor: colors.limeTint, flexDirection: 'row', alignItems: 'center', gap: space.m },
  pressed: { transform: [{ scale: 0.98 }] },
  thumb: { width: 64, height: 64, borderRadius: radius.s },
  flex: { flex: 1, gap: 2 },
  sticker: { position: 'absolute', right: 14, top: -18 },
  title: { paddingRight: 64 },
  text: { fontSize: 15, lineHeight: 21 },
  button: { alignSelf: 'flex-start', marginTop: space.s },
  more: { textAlign: 'center' },
});
