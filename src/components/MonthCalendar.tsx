import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { locale, t } from '@/i18n';
import { formatMonth, toIso } from '@/lib/dates';
import { colors, fonts, radius, space, touchTarget } from '@/theme';
import { AppText } from './AppText';

export type DayLook = {
  background: string;
  color: string;
  /** Small text under the day number (e.g. "3/4"). */
  note?: string;
  disabled?: boolean;
  /** Spoken by screen readers after the date. */
  description?: string;
};

type Props = {
  /** Month shown first, as "YYYY-MM". */
  startMonth: string;
  /** Earliest month reachable with the arrows, as "YYYY-MM". */
  minMonth?: string;
  lookFor: (iso: string) => DayLook;
  onPressDay?: (iso: string) => void;
};

function weekdayInitials() {
  const fmt = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'fr-FR', { weekday: 'narrow' });
  // 2024-01-01 was a Monday: weeks start on Monday.
  return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 1 + i)));
}

function dayLabel(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(y, m - 1, d));
}

/** One month at a time, Monday first, with arrows to move between months. */
export function MonthCalendar({ startMonth, minMonth, lookFor, onPressDay }: Props) {
  const [year0, month0] = startMonth.split('-').map(Number);
  const [cursor, setCursor] = useState({ year: year0, month: month0 - 1 });
  const initials = useMemo(() => weekdayInitials(), []);

  const cells = useMemo(() => {
    const first = new Date(cursor.year, cursor.month, 1);
    const offset = (first.getDay() + 6) % 7; // Monday = 0
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
    const list: (string | null)[] = Array.from({ length: offset }, () => null);
    for (let d = 1; d <= daysInMonth; d++) list.push(toIso(new Date(cursor.year, cursor.month, d)));
    while (list.length % 7 !== 0) list.push(null);
    return list;
  }, [cursor]);

  const key = `${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}`;
  const canGoBack = !minMonth || key > minMonth;
  const move = (delta: number) =>
    setCursor(({ year, month }) => {
      const next = new Date(year, month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Arrow direction="left" label={t('answers.prevMonth')} disabled={!canGoBack} onPress={() => move(-1)} />
        <AppText variant="bodyStrong" style={styles.month} accessibilityRole="header">
          {formatMonth(cursor.year, cursor.month)}
        </AppText>
        <Arrow direction="right" label={t('answers.nextMonth')} onPress={() => move(1)} />
      </View>

      <View style={styles.row}>
        {initials.map((letter, i) => (
          <View key={i} style={styles.weekday}>
            <AppText variant="caption" color={colors.textMuted}>
              {letter}
            </AppText>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((iso, i) => {
          if (!iso) return <View key={`empty-${i}`} style={styles.cell} />;
          const look = lookFor(iso);
          const day = Number(iso.slice(8));
          return (
            <View key={iso} style={styles.cell}>
              <Pressable
                accessibilityRole={onPressDay ? 'button' : undefined}
                accessibilityLabel={[dayLabel(iso), look.description].filter(Boolean).join(', ')}
                accessibilityState={{ disabled: look.disabled }}
                disabled={!onPressDay || look.disabled}
                onPress={() => onPressDay?.(iso)}
                style={({ pressed }) => [
                  styles.day,
                  { backgroundColor: look.background },
                  look.disabled && styles.disabled,
                  pressed && styles.pressed,
                ]}
              >
                <AppText style={[styles.dayNumber, { color: look.color }]}>{day}</AppText>
                {look.note ? <AppText style={[styles.note, { color: look.color }]}>{look.note}</AppText> : null}
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function Arrow({ direction, label, disabled, onPress }: { direction: 'left' | 'right'; label: string; disabled?: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.arrow, disabled && styles.disabled, pressed && styles.pressed]}
    >
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.black} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <Path d={direction === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.s },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  month: { textTransform: 'capitalize' },
  arrow: { width: touchTarget, height: touchTarget, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  row: { flexDirection: 'row' },
  weekday: { width: `${100 / 7}%`, height: 28, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, padding: 2, alignItems: 'center', justifyContent: 'center' },
  day: { flex: 1, alignSelf: 'stretch', borderRadius: radius.s, alignItems: 'center', justifyContent: 'center' },
  dayNumber: { fontFamily: fonts.bodyStrong, fontSize: 15, lineHeight: 19 },
  note: { fontFamily: fonts.bodyStrong, fontSize: 10, lineHeight: 12 },
  disabled: { opacity: 0.35 },
  pressed: { transform: [{ scale: 0.94 }] },
});
