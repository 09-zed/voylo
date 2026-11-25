import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { t } from '@/i18n';
import { colors, fonts } from '@/theme';
import { AppText } from './AppText';

const TABS: Record<string, { label: string; icon: (color: string) => React.ReactNode }> = {
  accueil: {
    label: 'tabs.home',
    icon: (c) => <Path d="M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" stroke={c} />,
  },
  voyages: {
    label: 'tabs.trips',
    icon: (c) => (
      <>
        <Path d="M14.1 5.55a2 2 0 0 0 1.8 0l3.65-1.83A1 1 0 0 1 21 4.62v12.76a1 1 0 0 1-.55.9l-4.55 2.27a2 2 0 0 1-1.8 0l-4.2-2.1a2 2 0 0 0-1.8 0l-3.65 1.83A1 1 0 0 1 3 19.38V6.62a1 1 0 0 1 .55-.9L8.1 3.45a2 2 0 0 1 1.8 0z" stroke={c} />
        <Path d="M15 5.76v15" stroke={c} />
        <Path d="M9 3.24v15" stroke={c} />
      </>
    ),
  },
  profil: {
    label: 'tabs.profile',
    icon: (c) => (
      <>
        <Circle cx={12} cy={8} r={4.5} stroke={c} />
        <Path d="M20 21a8 8 0 0 0-16 0" stroke={c} />
      </>
    ),
  },
};

/** The bottom bar from the mockups: the active tab's icon sits in a black pill. */
export function TabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]} accessibilityRole="tablist">
      {state.routes.map((route, index) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const focused = state.index === index;
        const onPress = () => {
          const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigateToTab(route.key);
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            onPress={onPress}
            style={styles.item}
          >
            <View style={[styles.pill, focused && styles.pillActive]}>
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                {tab.icon(focused ? colors.lime : colors.textMuted)}
              </Svg>
            </View>
            <AppText style={[styles.label, focused && styles.labelActive]} color={focused ? colors.black : colors.textMuted}>
              {t(tab.label)}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E6EAEE',
  },
  item: { flex: 1, alignItems: 'center', gap: 4, minHeight: 52 },
  pill: { width: 56, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  pillActive: { backgroundColor: colors.black },
  label: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16 },
  labelActive: { fontFamily: fonts.bodyStrong },
});
