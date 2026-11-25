import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import { daysUntil, formatRange } from '@/lib/dates';
import type { Trip } from '@/lib/trips';
import { colors, fonts, radius } from '@/theme';
import { AppText } from './AppText';
import { AvatarStack } from './AvatarStack';
import { CountdownSticker } from './CountdownSticker';
import { CoverImage } from './CoverImage';
import { Sticker } from './Sticker';

/** The big card for the next trip on the home tab, with a globe sticker on its corner. */
export function TripHeroCard({ trip, onPress }: { trip: Trip; onPress: () => void }) {
  const days = trip.startDate ? daysUntil(trip.startDate) : null;
  const when = trip.startDate ? formatRange(trip.startDate, trip.endDate ?? trip.startDate) : (trip.periodLabel ?? t('trips.noDate'));

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${trip.name}, ${when}`}
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        <CoverImage cover={trip.cover} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']} locations={[0.35, 1]} style={StyleSheet.absoluteFill} />
        {days !== null && days > 0 && (
          <View style={styles.sticker}>
            <CountdownSticker days={days} caption={t('trip.countdownSuffix')} />
          </View>
        )}
        <View style={styles.bottom}>
          <View style={styles.text}>
            <AppText style={styles.title} color={colors.white} numberOfLines={2}>
              {trip.name}
            </AppText>
            <AppText variant="bodyStrong" color={colors.white} style={styles.when}>
              {when}
            </AppText>
          </View>
          <AvatarStack members={trip.members.map((m) => ({ id: m.userId, name: m.firstName, color: m.color }))} size={32} max={4} />
        </View>
      </Pressable>
      <Sticker name="globe" width={64} tilt={-12} style={styles.globe} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { height: 220, borderRadius: radius.l, overflow: 'hidden', backgroundColor: colors.night },
  pressed: { transform: [{ scale: 0.98 }] },
  sticker: { position: 'absolute', top: 12, right: 12 },
  bottom: {
    position: 'absolute',
    left: 20,
    right: 16,
    bottom: 18,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  text: { flexShrink: 1, gap: 4 },
  title: { fontFamily: fonts.display, fontSize: 24, lineHeight: 27 },
  when: { fontSize: 14, lineHeight: 19 },
  globe: { position: 'absolute', left: -14, top: -20 },
});
