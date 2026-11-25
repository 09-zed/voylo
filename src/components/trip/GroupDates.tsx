import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import { formatRange, toIso } from '@/lib/dates';
import { bestRanges, countByDay, fixTripDates, type DateRange, type Planning } from '@/lib/planning';
import { reportError } from '@/lib/report';
import type { Trip } from '@/lib/trips';
import { colors, radius, space } from '@/theme';
import { AppText } from '../AppText';
import { Button } from '../Button';
import { MonthCalendar } from '../MonthCalendar';
import { Sticker } from '../Sticker';

type Props = {
  trip: Trip;
  planning: Planning;
  isOrganizer: boolean;
  /** Called after the organizer sets the dates, to reload the trip. */
  onChanged: () => void;
};

/** The "Dates" tab: the group calendar, the best stretches and, for organizers, setting the dates. */
export function GroupDates({ trip, planning, isOrganizer, onChanged }: Props) {
  const [fixing, setFixing] = useState<string | null>(null);
  const counts = countByDay(planning);
  const total = trip.members.length;
  const ranges = bestRanges(counts, 3, Math.ceil(total / 2));
  const today = toIso(new Date());
  const firstPicked = [...counts.keys()].sort().find((d) => d >= today);
  const startMonth = (trip.startDate ?? firstPicked ?? today).slice(0, 7);

  const confirmFix = (range: DateRange) => {
    const label = formatRange(range.start, range.end);
    Alert.alert(t('groupDates.fixConfirmTitle'), t('groupDates.fixConfirmText', { range: label }), [
      { text: t('groupDates.cancel'), style: 'cancel' },
      {
        text: t('groupDates.confirm'),
        onPress: async () => {
          setFixing(range.start);
          try {
            await fixTripDates(trip.id, range.start, range.end);
            onChanged();
          } catch (e) {
            reportError('fix dates', e);
            Alert.alert(t('errors.generic'));
          } finally {
            setFixing(null);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.wrap}>
      {trip.startDate ? (
        <View style={styles.fixed}>
          <AppText variant="bodyStrong" style={styles.fixedText}>
            {t('groupDates.fixed', { range: formatRange(trip.startDate, trip.endDate ?? trip.startDate) })}
          </AppText>
          <Sticker name="soleil" width={70} tilt={12} style={styles.sun} />
        </View>
      ) : (
        <AppText color={colors.textMuted}>{t('groupDates.subtitle')}</AppText>
      )}

      <MonthCalendar
        startMonth={startMonth}
        lookFor={(iso) => {
          const count = counts.get(iso) ?? 0;
          const all = total > 0 && count === total;
          const inTrip = !!trip.startDate && iso >= trip.startDate && iso <= (trip.endDate ?? trip.startDate);
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

      <Button
        label={t('planning.answersTitle')}
        onPress={() => router.push({ pathname: '/voyage/[id]/dispos', params: { id: trip.id } })}
      />

      {!trip.startDate && (
        <View style={styles.ranges}>
          <AppText variant="title">{t('groupDates.bestTitle')}</AppText>
          {ranges.length === 0 && <AppText color={colors.textMuted}>{t('groupDates.noAnswers')}</AppText>}
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
                <Button label={t('groupDates.fix')} variant="small" loading={fixing === range.start} onPress={() => confirmFix(range)} />
              )}
            </View>
          ))}
          {!isOrganizer && ranges.length > 0 && (
            <AppText variant="caption" color={colors.textMuted}>
              {t('groupDates.onlyOrganizer')}
            </AppText>
          )}
        </View>
      )}
    </View>
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
  wrap: { gap: space.l },
  fixed: {
    backgroundColor: colors.skyTint,
    borderRadius: radius.m,
    padding: space.l,
    paddingRight: 64,
    marginTop: space.s,
  },
  fixedText: { fontSize: 15, lineHeight: 21 },
  sun: { position: 'absolute', right: -10, top: -22 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: space.l },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  swatch: { width: 16, height: 16, borderRadius: 4, borderWidth: 1, borderColor: colors.border },
  ranges: { gap: space.m },
  range: { flexDirection: 'row', alignItems: 'center', gap: space.m, padding: space.l, borderRadius: radius.m, backgroundColor: colors.surface },
  rangeBest: { backgroundColor: colors.limeTint },
  rangeText: { flex: 1, gap: 2 },
});
