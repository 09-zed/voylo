import { router, useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { AppText } from '@/components/AppText';
import { AvatarStack } from '@/components/AvatarStack';
import { Button } from '@/components/Button';
import { CountdownSticker } from '@/components/CountdownSticker';
import { findDemoTrip } from '@/data/demo';
import { t } from '@/i18n';
import { daysUntil, formatDay, formatMoney } from '@/lib/dates';
import { colors, fonts, radius, space, touchTarget } from '@/theme';

export default function TripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const trip = findDemoTrip(id);

  if (!trip) {
    return null;
  }

  const voters = trip.poll.options.reduce((sum, o) => sum + o.votes, 0);
  const total = trip.members.length;
  const names = trip.members.map((m) => m.name);
  const groupLabel = `${names.slice(0, -1).join(', ')} ${t('trip.and')} ${names.at(-1)}`;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: insets.bottom + space.xl }}>
      <View style={[styles.hero, { paddingTop: insets.top + space.s }]}>
        <View style={styles.heroBar}>
          <RoundButton label={t('common.back')} onPress={() => router.back()}>
            <Path d="m15 18-6-6 6-6" />
          </RoundButton>
          <RoundButton label={t('trip.invite')} onPress={() => {}}>
            <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <Circle cx={9} cy={7} r={4} />
            <Path d="M19 8v6" />
            <Path d="M22 11h-6" />
          </RoundButton>
        </View>
        <AppText variant="caption" color="rgba(255, 255, 255, 0.75)" style={styles.photoLabel}>
          {t('trip.photoLabel')}
        </AppText>
        <AppText variant="display" color={colors.white} accessibilityRole="header" style={styles.heroTitle}>
          {trip.name}
        </AppText>
        <AppText variant="bodyStrong" color={colors.white} style={styles.departure}>
          {t('trip.departure', { date: formatDay(trip.departure) })}
        </AppText>
        <View style={styles.countdown}>
          <CountdownSticker days={daysUntil(trip.departure)} caption={t('trip.countdownSuffix')} />
        </View>
      </View>

      <View style={styles.group}>
        <AvatarStack members={trip.members} />
        <AppText variant="bodyStrong" style={styles.groupText}>
          {groupLabel}
        </AppText>
      </View>

      <View style={styles.cards}>
        <View style={[styles.card, styles.todo]}>
          <AppText style={styles.todoText}>{t('trip.missingBudget', { name: trip.pendingBudget })}</AppText>
          <Button label={t('trip.remind')} variant="small" onPress={() => {}} />
        </View>

        <View style={[styles.card, styles.poll]}>
          <View style={styles.pollHeader}>
            <AppText style={styles.pollQuestion}>{trip.poll.question}</AppText>
            <AppText variant="caption" numberOfLines={1} style={styles.votes}>
              {t('trip.votes', { count: voters, total })}
            </AppText>
          </View>
          {trip.poll.options.map((option) => (
            <Pressable
              key={option.label}
              accessibilityRole="button"
              accessibilityLabel={`${option.label}, ${option.votes}`}
              style={({ pressed }) => [styles.option, pressed && styles.pressed]}
            >
              <View style={[styles.optionFill, { width: `${voters ? (option.votes / voters) * 100 : 0}%` }]} />
              <AppText variant="bodyStrong" style={styles.optionText}>
                {option.label}
              </AppText>
              <AppText variant="bodyStrong">{option.votes}</AppText>
            </Pressable>
          ))}
        </View>

        <View style={[styles.card, styles.balance]}>
          <AppText color={colors.white}>{t('trip.youOwe', { name: trip.balance.to })}</AppText>
          <AppText style={styles.amount}>{formatMoney(trip.balance.amount)}</AppText>
        </View>
      </View>
    </ScrollView>
  );
}

function RoundButton({ label, onPress, children }: { label: string; onPress: () => void; children: ReactNode }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.round, pressed && styles.pressed]}>
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.black} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        {children}
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  hero: {
    minHeight: 300,
    backgroundColor: colors.night,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: space.xl - 4,
    paddingBottom: 28,
  },
  heroBar: { flexDirection: 'row', justifyContent: 'space-between' },
  round: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoLabel: { marginTop: space.l },
  heroTitle: { marginTop: 'auto', paddingTop: space.xxl, fontSize: 44, lineHeight: 48 },
  departure: { maxWidth: 190 },
  countdown: { position: 'absolute', right: 18, bottom: -34 },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.m,
    paddingHorizontal: space.xl - 4,
    paddingTop: space.xl,
  },
  groupText: { flexShrink: 1, fontSize: 15 },
  cards: { paddingHorizontal: space.xl - 4, paddingTop: space.xl - 4, gap: space.m },
  card: { borderRadius: radius.m, padding: space.l },
  todo: { backgroundColor: colors.sunsetTint, flexDirection: 'row', alignItems: 'center', gap: space.m },
  todoText: { flex: 1, fontSize: 15, lineHeight: 21 },
  poll: { backgroundColor: colors.skyTint, gap: space.s },
  pollHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: space.s },
  votes: { flexShrink: 0 },
  pollQuestion: { fontFamily: fonts.display, fontSize: 17, lineHeight: 22, flexShrink: 1 },
  option: {
    height: touchTarget,
    borderRadius: radius.s,
    backgroundColor: colors.white,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  optionFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: colors.lime },
  optionText: { fontSize: 15 },
  pressed: { transform: [{ scale: 0.97 }] },
  balance: {
    backgroundColor: colors.black,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amount: { fontFamily: fonts.display, fontSize: 24, lineHeight: 29, color: colors.lime, fontVariant: ['tabular-nums'] },
});
