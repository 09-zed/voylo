import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Sticker } from '@/components/Sticker';
import { TripCard } from '@/components/TripCard';
import { t } from '@/i18n';
import { toIso } from '@/lib/dates';
import { fetchTrips, isPastTrip, useLoad } from '@/lib/trips';
import { colors, fonts, radius, space, touchTarget } from '@/theme';

type Filter = 'upcoming' | 'past';

export default function TripsTab() {
  const insets = useSafeAreaInsets();
  const { data: trips, error, refresh } = useLoad(fetchTrips);
  const [filter, setFilter] = useState<Filter>('upcoming');

  const today = toIso(new Date());
  const upcoming = trips?.filter((trip) => !isPastTrip(trip, today)) ?? [];
  // Most recent first for past trips.
  const past = (trips?.filter((trip) => isPastTrip(trip, today)) ?? []).reverse();
  const shown = filter === 'upcoming' ? upcoming : past;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + space.l }]}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} />}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <AppText style={styles.title} accessibilityRole="header">
            {t('tabs.trips')}
          </AppText>
          <Sticker name="valise" width={48} tilt={10} />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('trips.create')}
          onPress={() => router.push('/nouveau-voyage')}
          style={({ pressed }) => [styles.plus, pressed && styles.pressed]}
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.lime} strokeWidth={2.6} strokeLinecap="round">
            <Path d="M12 5v14" />
            <Path d="M5 12h14" />
          </Svg>
        </Pressable>
      </View>

      <View style={styles.segmented} accessibilityRole="tablist" accessibilityLabel={t('trips.filterLabel')}>
        {(['upcoming', 'past'] as const).map((key) => {
          const selected = filter === key;
          const count = key === 'upcoming' ? upcoming.length : past.length;
          return (
            <Pressable
              key={key}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => setFilter(key)}
              style={[styles.segment, selected && styles.segmentSelected]}
            >
              <AppText variant="bodyStrong" style={styles.segmentText} color={selected ? colors.black : colors.textMuted}>
                {key === 'upcoming' ? t('trips.upcoming', { count }) : t('trips.past', { count })}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {error && !trips ? (
        <View style={styles.message}>
          <AppText>{t('errors.loadTrips')}</AppText>
          <Button label={t('common.retry')} variant="small" onPress={refresh} style={styles.alignStart} />
        </View>
      ) : !trips ? (
        <View style={styles.skeleton} />
      ) : shown.length === 0 ? (
        <AppText color={colors.textMuted} style={styles.emptyText}>
          {filter === 'upcoming' ? t('trips.emptyText') : t('trips.emptyPast')}
        </AppText>
      ) : (
        shown.map((trip) => (
          <TripCard key={trip.id} trip={trip} onPress={() => router.push({ pathname: '/voyage/[id]', params: { id: trip.id } })} />
        ))
      )}

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/rejoindre')}
        style={({ pressed }) => [styles.join, pressed && styles.pressed]}
      >
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.black} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <Path d="m10 17 5-5-5-5" />
          <Path d="M15 12H3" />
        </Svg>
        <AppText variant="bodyStrong" style={styles.joinText}>
          {t('trips.join')}
        </AppText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: space.xl, paddingBottom: space.xxl, gap: space.l },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  title: { fontFamily: fonts.display, fontSize: 32, lineHeight: 38, letterSpacing: -0.6 },
  plus: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { transform: [{ scale: 0.97 }] },
  segmented: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: radius.pill, backgroundColor: colors.surface },
  segment: { flex: 1, height: touchTarget, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  segmentSelected: { backgroundColor: colors.white, boxShadow: '0 1px 2px rgba(20, 40, 60, 0.12)' },
  segmentText: { fontSize: 15 },
  message: { gap: space.m },
  alignStart: { alignSelf: 'flex-start' },
  skeleton: { height: 200, borderRadius: radius.l, backgroundColor: colors.surface },
  emptyText: { paddingVertical: space.l },
  join: {
    minHeight: 52,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#C9D1D9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.s,
  },
  joinText: { fontSize: 15 },
});
