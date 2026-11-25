import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { t } from '@/i18n';
import { colors, touchTarget } from '@/theme';

/** Goes back, or to "Mes voyages" when there is nothing to go back to. */
export function BackButton() {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('common.back')}
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/voyages'))}
      style={styles.back}
    >
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.black} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="m15 18-6-6 6-6" />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  back: {
    width: touchTarget,
    height: touchTarget,
    marginLeft: -10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
