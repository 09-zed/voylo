import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';
import { AppText } from './AppText';

/** A line of text on a slightly tilted lime marker stroke. */
export function Highlight({ children, tilt = -3, size = 32 }: { children: string; tilt?: number; size?: number }) {
  return (
    <View style={[styles.band, { transform: [{ rotate: `${tilt}deg` }] }]}>
      <AppText variant="display" style={{ fontSize: size, lineHeight: Math.round(size * 1.15) }}>
        {children}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    alignSelf: 'flex-start',
    backgroundColor: colors.lime,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
});
