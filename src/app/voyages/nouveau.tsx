import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { FormScreen } from '@/components/FormScreen';
import { TextField } from '@/components/TextField';
import { t } from '@/i18n';
import { COVERS, coverLabel } from '@/lib/covers';
import { daysUntil, maskDateInput, parseDateInput } from '@/lib/dates';
import { createTrip, type CoverKey } from '@/lib/trips';
import { colors, radius, space, touchTarget } from '@/theme';

export default function NewTripScreen() {
  const [name, setName] = useState('');
  const [cover, setCover] = useState<CoverKey>('ville');
  const [date, setDate] = useState('');
  const [period, setPeriod] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isoDate = date.length === 10 ? parseDateInput(date) : null;
  const dateError =
    date.length === 10 && !isoDate
      ? t('create.dateInvalid')
      : isoDate && daysUntil(isoDate) < 0
        ? t('create.datePast')
        : null;
  const dateOk = date.length === 0 || (isoDate !== null && dateError === null);
  const valid = name.trim().length > 0 && dateOk;

  const submit = async () => {
    if (!valid || saving) return;
    setSaving(true);
    setError(null);
    try {
      const id = await createTrip({
        name: name.trim(),
        cover,
        startDate: isoDate,
        periodLabel: isoDate ? null : period.trim() || null,
      });
      router.replace({ pathname: '/voyages/[id]', params: { id, nouveau: '1' } });
    } catch {
      setError(t('errors.generic'));
      setSaving(false);
    }
  };

  return (
    <FormScreen
      title={t('create.title')}
      subtitle={t('create.subtitle')}
      footer={
        <>
          {error && (
            <AppText variant="caption" color={colors.error} accessibilityRole="alert">
              {error}
            </AppText>
          )}
          <Button label={t('create.submit')} disabled={!valid} loading={saving} onPress={submit} />
        </>
      }
    >
      <TextField
        label={t('create.nameLabel')}
        placeholder={t('create.namePlaceholder')}
        value={name}
        onChangeText={setName}
        maxLength={60}
        autoCapitalize="sentences"
        autoFocus
      />

      <View style={styles.group}>
        <AppText variant="caption">{t('create.coverLabel')}</AppText>
        <View style={styles.covers} accessibilityRole="radiogroup">
          {COVERS.map((c) => {
            const selected = c.key === cover;
            return (
              <Pressable
                key={c.key}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                onPress={() => setCover(c.key)}
                style={({ pressed }) => [
                  styles.cover,
                  { backgroundColor: c.color },
                  selected && styles.coverSelected,
                  pressed && styles.pressed,
                ]}
              >
                <AppText variant="bodyStrong" color={c.textColor} style={styles.coverText}>
                  {coverLabel(c.key)}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <TextField
        label={t('create.dateLabel')}
        placeholder={t('create.datePlaceholder')}
        value={date}
        onChangeText={(value) => setDate(maskDateInput(value))}
        keyboardType="number-pad"
        maxLength={10}
        error={dateError}
      />

      {date.length === 0 && (
        <TextField
          label={t('create.periodLabel')}
          placeholder={t('create.periodPlaceholder')}
          value={period}
          onChangeText={setPeriod}
          maxLength={60}
        />
      )}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  group: { gap: space.s },
  covers: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
  cover: {
    minHeight: touchTarget,
    paddingHorizontal: space.l,
    borderRadius: radius.pill,
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  coverSelected: { borderColor: colors.black },
  coverText: { fontSize: 15 },
  pressed: { transform: [{ scale: 0.97 }] },
});
