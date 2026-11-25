import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { t } from '@/i18n';
import { colors, fonts, radius, space, touchTarget } from '@/theme';
import { AppText } from '../AppText';

export const TRIP_TABS = ['apercu', 'dates', 'sondages', 'planning', 'depenses'] as const;
export type TripTab = (typeof TRIP_TABS)[number];

export function isTripTab(value: unknown): value is TripTab {
  return typeof value === 'string' && (TRIP_TABS as readonly string[]).includes(value);
}

/** The trip's sections, as a row of pills that scrolls sideways. */
export function TripTabs({ active, onChange }: { active: TripTab; onChange: (tab: TripTab) => void }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityRole="tablist"
      accessibilityLabel={t('tripTabs.label')}
    >
      {TRIP_TABS.map((tab) => {
        const selected = tab === active;
        return (
          <Pressable
            key={tab}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(tab)}
            style={({ pressed }) => [styles.pill, selected && styles.selected, pressed && styles.pressed]}
          >
            <AppText style={styles.label} color={selected ? colors.lime : colors.black}>
              {t(`tripTabs.${tab}`)}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: space.l, paddingVertical: space.m - 2, gap: 6 },
  pill: {
    height: touchTarget,
    paddingHorizontal: space.l,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  selected: { backgroundColor: colors.black },
  pressed: { transform: [{ scale: 0.97 }] },
  label: { fontFamily: fonts.bodyStrong, fontSize: 15, lineHeight: 20 },
});
