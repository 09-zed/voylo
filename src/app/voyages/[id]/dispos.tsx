import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { FormScreen } from '@/components/FormScreen';
import { MonthCalendar } from '@/components/MonthCalendar';
import { t } from '@/i18n';
import { useAuth } from '@/lib/auth';
import { daysUntil, formatEuros, formatRange, toIso } from '@/lib/dates';
import { BUDGETS, fetchPlanning, saveMyAnswers, VIBES, type MemberAnswers, type Vibe } from '@/lib/planning';
import { fetchTrip, useLoad, type Trip } from '@/lib/trips';
import { colors, space } from '@/theme';

function budgetLabel(min: number, max: number | null) {
  if (min === 0 && max !== null) return t('budgets.under', { max: formatEuros(max) });
  if (max === null) return t('budgets.over', { min: formatEuros(min) });
  return t('budgets.between', { min: formatEuros(min), max: formatEuros(max) });
}

export default function MyAnswersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const me = session?.user.id ?? '';
  const { data } = useLoad(async () => {
    const [trip, planning] = await Promise.all([fetchTrip(id), fetchPlanning(id)]);
    return { trip, mine: planning.get(me) };
  });

  // The form only mounts once the saved answers are known, so it can start from them.
  if (!data) return <View style={styles.loading} />;
  return <AnswersForm id={id} trip={data.trip} mine={data.mine} />;
}

function AnswersForm({ id, trip, mine }: { id: string; trip: Trip | null; mine: MemberAnswers | undefined }) {
  const [days, setDays] = useState<Set<string>>(() => new Set(mine?.days));
  const [budget, setBudget] = useState<number | null>(() => {
    const index = BUDGETS.findIndex((b) => b.min === mine?.budgetMin && b.max === mine?.budgetMax);
    return index >= 0 ? index : null;
  });
  const [vibes, setVibes] = useState<Set<Vibe>>(() => new Set(mine?.vibes));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const datesFixed = !!trip?.startDate;
  const today = toIso(new Date());
  const startMonth = (trip?.startDate && trip.startDate > today ? trip.startDate : today).slice(0, 7);

  const toggleDay = (iso: string) =>
    setDays((prev) => {
      const next = new Set(prev);
      if (next.has(iso)) next.delete(iso);
      else next.add(iso);
      return next;
    });

  const toggleVibe = (vibe: Vibe) =>
    setVibes((prev) => {
      const next = new Set(prev);
      if (next.has(vibe)) next.delete(vibe);
      else next.add(vibe);
      return next;
    });

  const save = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const picked = budget === null ? null : BUDGETS[budget];
      await saveMyAnswers(id, {
        // When the dates are already set, the calendar isn't shown: leave saved days alone.
        days: datesFixed ? null : [...days].filter((d) => daysUntil(d) >= 0).sort(),
        budgetMin: picked ? picked.min : null,
        budgetMax: picked ? picked.max : null,
        vibes: [...vibes],
      });
      router.back();
    } catch {
      setError(t('errors.generic'));
      setSaving(false);
    }
  };

  const countLabel =
    days.size === 0 ? t('answers.daysNone') : days.size === 1 ? t('answers.daysOne') : t('answers.daysCount', { count: days.size });

  return (
    <FormScreen
      title={t('answers.title')}
      subtitle={datesFixed && trip?.startDate ? t('answers.datesFixed', { range: formatRange(trip.startDate, trip.endDate ?? trip.startDate) }) : t('answers.subtitle')}
      footer={
        <>
          {error && (
            <AppText variant="caption" color={colors.error} accessibilityRole="alert">
              {error}
            </AppText>
          )}
          <Button label={t('answers.save')} loading={saving} onPress={save} />
        </>
      }
    >
      {!datesFixed && (
        <View style={styles.section}>
          <MonthCalendar
            startMonth={startMonth}
            minMonth={today.slice(0, 7)}
            onPressDay={toggleDay}
            lookFor={(iso) => {
              const picked = days.has(iso);
              return {
                background: picked ? colors.lime : colors.surface,
                color: colors.black,
                disabled: iso < today,
                description: picked ? t('answers.picked') : undefined,
              };
            }}
          />
          <View style={styles.countRow}>
            <AppText variant="bodyStrong">{countLabel}</AppText>
            {days.size > 0 && <Button label={t('answers.clear')} variant="link" onPress={() => setDays(new Set())} />}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <AppText variant="title">{t('answers.budgetTitle')}</AppText>
        <AppText color={colors.textMuted} style={styles.hint}>
          {t('answers.budgetHint')}
        </AppText>
        <View style={styles.chips} accessibilityRole="radiogroup">
          {BUDGETS.map((b, index) => (
            <Chip
              key={index}
              kind="radio"
              label={budgetLabel(b.min, b.max)}
              selected={budget === index}
              onPress={() => setBudget(budget === index ? null : index)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="title">{t('answers.vibesTitle')}</AppText>
        <AppText color={colors.textMuted} style={styles.hint}>
          {t('answers.vibesHint')}
        </AppText>
        <View style={styles.chips}>
          {VIBES.map((vibe) => (
            <Chip key={vibe} label={t(`vibes.${vibe}`)} selected={vibes.has(vibe)} onPress={() => toggleVibe(vibe)} />
          ))}
        </View>
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.white },
  section: { gap: space.s, marginBottom: space.l },
  countRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48 },
  hint: { fontSize: 15, lineHeight: 21 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s, marginTop: space.xs },
});
