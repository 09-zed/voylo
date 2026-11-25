import { Pressable, StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import { daysUntil, formatDay } from '@/lib/dates';
import type { Trip } from '@/lib/trips';
import { colors, radius, space } from '@/theme';
import { AppText } from './AppText';
import { AvatarStack } from './AvatarStack';
import { CoverImage } from './CoverImage';
import { CountdownSticker } from './CountdownSticker';

export function TripCard({ trip, onPress }: { trip: Trip; onPress: () => void }) {
  const days = trip.startDate ? daysUntil(trip.startDate) : null;
  const when = trip.startDate ? formatDay(trip.startDate) : (trip.periodLabel ?? t('trips.noDate'));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${trip.name}, ${when}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View>
        <CoverImage cover={trip.cover} style={styles.cover} />
        {days !== null && days >= 0 && (
          <View style={styles.sticker}>
            <CountdownSticker days={days} caption={t('trip.countdownSuffix')} size="small" />
          </View>
        )}
      </View>
      <View style={styles.body}>
        <View style={styles.text}>
          <AppText variant="title" numberOfLines={1}>
            {trip.name}
          </AppText>
          <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
            {when}
          </AppText>
        </View>
        <AvatarStack members={trip.members.map((m) => ({ id: m.userId, name: m.firstName, color: m.color }))} size={32} max={4} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.l, backgroundColor: colors.surface, overflow: 'hidden' },
  pressed: { transform: [{ scale: 0.98 }] },
  cover: { height: 140 },
  sticker: { position: 'absolute', top: space.m, right: space.m },
  body: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: space.l, gap: space.m },
  text: { flexShrink: 1, gap: 2 },
});
