import { router, useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, RefreshControl, ScrollView, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { AppText } from '@/components/AppText';
import { AvatarStack } from '@/components/AvatarStack';
import { Button } from '@/components/Button';
import { CountdownSticker } from '@/components/CountdownSticker';
import { InviteCard } from '@/components/InviteCard';
import { t } from '@/i18n';
import { coverFor } from '@/lib/covers';
import { daysUntil, formatDay } from '@/lib/dates';
import { fetchTrip, useLoad, type Trip } from '@/lib/trips';
import { colors, radius, space, touchTarget } from '@/theme';

export default function TripScreen() {
  const { id, nouveau } = useLocalSearchParams<{ id: string; nouveau?: string }>();
  const insets = useSafeAreaInsets();
  const { data: trip, error, loading, refresh } = useLoad(() => fetchTrip(id));

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/voyages'));

  if (loading && !trip) {
    return <View style={[styles.screen, styles.heroPlaceholder]} />;
  }

  if (!trip) {
    return (
      <View style={[styles.screen, styles.missing, { paddingTop: insets.top + space.xxl }]}>
        <AppText>{error ? t('errors.generic') : t('errors.tripNotFound')}</AppText>
        <Button label={error ? t('common.retry') : t('common.back')} variant="small" onPress={error ? refresh : goBack} />
      </View>
    );
  }

  const cover = coverFor(trip.cover);
  const days = trip.startDate ? daysUntil(trip.startDate) : null;
  const solo = trip.members.length === 1;
  const inviteFirst = nouveau === '1' || solo;
  const share = () => Share.share({ message: t('trip.shareMessage', { name: trip.name, code: trip.inviteCode }) });

  const invite = <InviteCard tripName={trip.name} code={trip.inviteCode} solo={solo} />;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: insets.bottom + space.xxl }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} />}
    >
      <View style={[styles.hero, { backgroundColor: cover.color, paddingTop: insets.top + space.s }]}>
        <View style={styles.heroBar}>
          <RoundButton label={t('common.back')} onPress={goBack}>
            <Path d="m15 18-6-6 6-6" />
          </RoundButton>
          <RoundButton label={t('trip.invite')} onPress={share}>
            <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <Circle cx={9} cy={7} r={4} />
            <Path d="M19 8v6" />
            <Path d="M22 11h-6" />
          </RoundButton>
        </View>
        <AppText variant="display" color={cover.textColor} accessibilityRole="header" style={styles.heroTitle}>
          {trip.name}
        </AppText>
        <AppText variant="bodyStrong" color={cover.textColor} style={styles.when}>
          {trip.startDate
            ? days === 0
              ? t('trip.today')
              : t('trip.departure', { date: formatDay(trip.startDate) })
            : (trip.periodLabel ?? t('trips.noDate'))}
        </AppText>
        {days !== null && days > 0 && (
          <View style={styles.countdown}>
            <CountdownSticker days={days} caption={t('trip.countdownSuffix')} />
          </View>
        )}
      </View>

      <Members trip={trip} />

      <View style={styles.sections}>
        {inviteFirst && invite}

        <View style={styles.next}>
          <AppText variant="title">{t('trip.nextTitle')}</AppText>
          {[t('trip.nextDates'), t('trip.nextPolls'), t('trip.nextExpenses')].map((label) => (
            <View key={label} style={styles.nextRow}>
              <View style={styles.dot} />
              <AppText style={styles.nextText}>{label}</AppText>
            </View>
          ))}
        </View>

        {!inviteFirst && invite}
      </View>
    </ScrollView>
  );
}

function Members({ trip }: { trip: Trip }) {
  const names = trip.members.map((m) => m.firstName);
  const label =
    names.length > 1 ? `${names.slice(0, -1).join(', ')} ${t('common.and')} ${names.at(-1)}` : (names[0] ?? '');
  const organizers = trip.members.filter((m) => m.role === 'organisateur').map((m) => m.firstName);

  return (
    <View style={styles.group}>
      <AvatarStack members={trip.members.map((m) => ({ id: m.userId, name: m.firstName, color: m.color }))} />
      <View style={styles.groupText}>
        <AppText variant="bodyStrong" style={styles.groupNames}>
          {label}
        </AppText>
        <AppText variant="caption" color={colors.textMuted}>
          {`${t('trip.organizer')} : ${organizers.join(', ')}`}
        </AppText>
      </View>
    </View>
  );
}

function RoundButton({ label, onPress, children }: { label: string; onPress: () => void; children: ReactNode }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.round, pressed && styles.pressed]}
    >
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.black} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        {children}
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  heroPlaceholder: { backgroundColor: colors.surface },
  missing: { paddingHorizontal: space.xl, gap: space.l, alignItems: 'flex-start' },
  hero: {
    minHeight: 280,
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
  pressed: { transform: [{ scale: 0.97 }] },
  heroTitle: { marginTop: 'auto', paddingTop: space.xxl, fontSize: 40, lineHeight: 45 },
  when: { maxWidth: 190 },
  countdown: { position: 'absolute', right: 18, bottom: -34 },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.m,
    paddingHorizontal: space.xl - 4,
    paddingTop: space.xl,
    paddingRight: 130,
  },
  groupText: { flexShrink: 1 },
  groupNames: { fontSize: 15, lineHeight: 21 },
  sections: { paddingHorizontal: space.xl - 4, paddingTop: space.xl, gap: space.l },
  next: { backgroundColor: colors.surface, borderRadius: radius.m, padding: space.xl, gap: space.m },
  nextRow: { flexDirection: 'row', alignItems: 'center', gap: space.m },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.sunset },
  nextText: { flexShrink: 1, fontSize: 15, lineHeight: 21 },
});
