import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/Button';
import { MonthCalendar } from '@/components/MonthCalendar';
import { t } from '@/i18n';
import { useAuth } from '@/lib/auth';
import { formatRange, toIso } from '@/lib/dates';
import { bestRanges, countByDay, fetchPlanning, fixTripDates, type DateRange } from '@/lib/planning';
import { reportError } from '@/lib/report';
import { fetchTrip, useLoad } from '@/lib/trips';
import { colors, radius, space } from '@/theme';

export default function GroupDatesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const [fixing, setFixing] = useState<string | null>(null);
  const { data } = useLoad(async () => {
    const [trip, planning] = await Promise.all([fetchTrip(id), fetchPlanning(id)]);
    return { trip, counts: countByDay(planning) };
  });

  const trip = data?.trip;
  const counts = data?.counts ?? new Map<string, number>();
  const total = trip?.members.length ?? 0;
  const ranges = bestRanges(counts, 3, Math.ceil(total / 2));
  const isOrganizer = !!trip?.members.some((m) => m.userId === session?.user.id && m.role === 'organisateur');
  const today = toIso(new Date());
  const firstPicked = [...counts.keys()].sort().find((d) => d >= today);
  const startMonth = (trip?.startDate ?? firstPicked ?? today).slice(0, 7);

  const confirmFix = (range: DateRange) => {
    const label = formatRange(range.start, range.end);
    Alert.alert(t('groupDates.fixConfirmTitle'), t('groupDates.fixConfirmText', { range: label }), [
      { text: t('groupDates.cancel'), style: 'cancel' },
      {
        text: t('groupDates.confirm'),
        onPress: async () => {
          setFixing(range.start);
          try {
            await fixTripDates(id, range.start, range.end);
            router.back();
          } catch (e) {
            reportError('fix dates', e);
            setFixing(null);
            Alert.alert(t('errors.generic'));
          }
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + space.s, paddingBottom: insets.bottom + space.xxl }]}
    >
      <BackButton />
      <AppText variant="display" accessibilityRole="header" style={styles.title}>
        {t('groupDates.title')}
      </AppText>
      <AppText color={colors.textMuted}>
        {trip?.startDate
          ? t('groupDates.fixed', { range: formatRange(trip.startDate, trip.endDate ?? trip.startDate) })
          : t('groupDates.subtitle')}
      </AppText>

      {data && (
        <View style={styles.calendar}>
          <MonthCalendar
            startMonth={startMonth}
            lookFor={(iso) => {
              const count = counts.get(iso) ?? 0;
              const all = total > 0 && count === total;
              const inTrip = !!trip?.startDate && iso >= trip.startDate && iso <= (trip.endDate ?? trip.startDate);
              return {
                background: inTrip ? colors.sky : all ? colors.lime : count > 0 ? colors.limeTint : colors.surface,
                color: colors.black,
                note: count > 0 ? `${count}/${total}` : undefined,
                description: t('groupDates.rangeAvailability', { count, total }),
              };
            }}
          />
          <View style={styles.legend}>
            <Legend color={colors.surface} label={t('groupDates.legendNone')} />
            <Legend color={colors.limeTint} label={t('groupDates.legendSome')} />
            <Legend color={colors.lime} label={t('groupDates.legendAll')} />
          </View>
        </View>
      )}

      <AppText variant="title" style={styles.sectionTitle}>
        {t('groupDates.bestTitle')}
      </AppText>
      {data && ranges.length === 0 && <AppText color={colors.textMuted}>{t('groupDates.noAnswers')}</AppText>}
      <View style={styles.ranges}>
        {ranges.map((range) => (
          <View key={`${range.start}-${range.available}`} style={[styles.range, range.available === total && styles.rangeBest]}>
            <View style={styles.rangeText}>
              <AppText variant="bodyStrong">{formatRange(range.start, range.end)}</AppText>
              <AppText variant="caption">
                {`${t('groupDates.rangeAvailability', { count: range.available, total })} · ${
                  range.length === 1 ? t('groupDates.oneDay') : t('groupDates.days', { count: range.length })
                }`}
              </AppText>
            </View>
            {isOrganizer && (
              <Button
                label={t('groupDates.fix')}
                variant="small"
                loading={fixing === range.start}
                onPress={() => confirmFix(range)}
              />
            )}
          </View>
        ))}
      </View>
      {!isOrganizer && ranges.length > 0 && (
        <AppText variant="caption" color={colors.textMuted} style={styles.note}>
          {t('groupDates.onlyOrganizer')}
        </AppText>
      )}
    </ScrollView>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.swatch, { backgroundColor: color }]} />
      <AppText variant="caption">{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: space.xl },
  title: { marginTop: space.xl, marginBottom: space.s },
  calendar: { marginTop: space.xl, gap: space.m },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: space.l },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  swatch: { width: 16, height: 16, borderRadius: 4, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { marginTop: space.xxl, marginBottom: space.m },
  ranges: { gap: space.m },
  range: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.m,
    padding: space.l,
    borderRadius: radius.m,
    backgroundColor: colors.surface,
  },
  rangeBest: { backgroundColor: colors.limeTint },
  rangeText: { flex: 1, gap: 2 },
  note: { marginTop: space.m },
});
